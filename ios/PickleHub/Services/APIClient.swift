import Foundation

enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(statusCode: Int, message: String)
    case decodingError(Error)
    case networkError(Error)
    case unauthorized

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .httpError(let statusCode, let message):
            return "HTTP \(statusCode): \(message)"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .unauthorized:
            return "Unauthorized access"
        }
    }
}

class APIClient {
    static let shared = APIClient()

    private let baseURL = Config.apiBaseURL
    private var authToken: String?

    private init() {}

    // MARK: - Authentication

    func setAuthToken(_ token: String?) {
        self.authToken = token
    }

    // MARK: - Generic Request Method

    private func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Encodable? = nil,
        requiresAuth: Bool = false
    ) async throws -> T {
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add auth token if required
        if requiresAuth || authToken != nil {
            if let token = authToken {
                request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            } else if requiresAuth {
                throw APIError.unauthorized
            }
        }

        // Add body if present
        if let body = body {
            do {
                request.httpBody = try JSONEncoder().encode(body)
            } catch {
                throw APIError.decodingError(error)
            }
        }

        // Perform request
        do {
            let (data, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }

            // Check status code
            guard (200...299).contains(httpResponse.statusCode) else {
                let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
                throw APIError.httpError(statusCode: httpResponse.statusCode, message: errorMessage)
            }

            // Decode response
            do {
                let decoder = JSONDecoder()
                return try decoder.decode(T.self, from: data)
            } catch {
                throw APIError.decodingError(error)
            }
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error)
        }
    }

    // MARK: - Auth API

    func signInWithGoogle(idToken: String) async throws -> GoogleSignInResponse {
        let requestBody = GoogleSignInRequest(idToken: idToken)
        let response: GoogleSignInResponse = try await request(
            endpoint: Config.Endpoint.auth,
            method: "POST",
            body: requestBody
        )
        self.authToken = response.token
        return response
    }

    // MARK: - Events API

    func getEvents(status: String = "active", upcoming: Bool = true) async throws -> [Event] {
        var endpoint = "\(Config.Endpoint.events)?status=\(status)"
        if upcoming {
            endpoint += "&upcoming=true"
        }
        return try await request(endpoint: endpoint)
    }

    func getEvent(id: String) async throws -> Event {
        return try await request(endpoint: Config.Endpoint.event(id: id))
    }

    func createEvent(request: CreateEventRequest) async throws -> Event {
        return try await self.request(
            endpoint: Config.Endpoint.events,
            method: "POST",
            body: request,
            requiresAuth: true
        )
    }

    func updateEvent(id: String, request: UpdateEventRequest) async throws -> Event {
        return try await self.request(
            endpoint: Config.Endpoint.event(id: id),
            method: "PATCH",
            body: request,
            requiresAuth: true
        )
    }

    func deleteEvent(id: String) async throws {
        struct EmptyResponse: Codable {}
        let _: EmptyResponse = try await request(
            endpoint: Config.Endpoint.event(id: id),
            method: "DELETE",
            requiresAuth: true
        )
    }

    // MARK: - Reservations API

    func getReservations() async throws -> [Reservation] {
        return try await request(
            endpoint: Config.Endpoint.reservations,
            requiresAuth: true
        )
    }

    func createReservation(eventId: String) async throws -> Reservation {
        let requestBody = CreateReservationRequest(eventId: eventId)
        return try await request(
            endpoint: Config.Endpoint.reservations,
            method: "POST",
            body: requestBody,
            requiresAuth: true
        )
    }

    func cancelReservation(id: String) async throws {
        struct EmptyResponse: Codable {}
        let _: EmptyResponse = try await request(
            endpoint: Config.Endpoint.reservation(id: id),
            method: "DELETE",
            requiresAuth: true
        )
    }

    // MARK: - Chat API

    func getChatRoom(eventId: String) async throws -> ChatRoom {
        return try await request(
            endpoint: Config.Endpoint.chatRoom(eventId: eventId),
            requiresAuth: true
        )
    }

    func sendMessage(chatRoomId: String, content: String) async throws -> Message {
        let requestBody = SendMessageRequest(chatRoomId: chatRoomId, content: content)
        return try await request(
            endpoint: Config.Endpoint.chatMessages,
            method: "POST",
            body: requestBody,
            requiresAuth: true
        )
    }
}
