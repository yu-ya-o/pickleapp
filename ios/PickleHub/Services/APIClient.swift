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
            // For client errors (4xx), just show the message
            if (400...499).contains(statusCode) {
                return message
            }
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

                // Try to parse error message from JSON response
                if let errorData = errorMessage.data(using: .utf8),
                   let errorJson = try? JSONSerialization.jsonObject(with: errorData) as? [String: Any],
                   let message = errorJson["message"] as? String {
                    throw APIError.httpError(statusCode: httpResponse.statusCode, message: message)
                }

                throw APIError.httpError(statusCode: httpResponse.statusCode, message: errorMessage)
            }

            // Decode response
            do {
                let decoder = JSONDecoder()
                let decoded = try decoder.decode(T.self, from: data)

                // Debug logging
                if let jsonString = String(data: data, encoding: .utf8) {
                    print("🔍 API Response for \(endpoint): \(jsonString.prefix(500))")
                }

                return decoded
            } catch {
                print("❌ Decoding error for \(endpoint): \(error)")
                if let jsonString = String(data: data, encoding: .utf8) {
                    print("📄 Raw response: \(jsonString)")
                }
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

    // MARK: - Profile API

    func getProfile() async throws -> User {
        return try await request(
            endpoint: "/api/profile",
            requiresAuth: true
        )
    }

    func updateProfile(request: UpdateProfileRequest) async throws -> User {
        return try await self.request(
            endpoint: "/api/profile",
            method: "PATCH",
            body: request,
            requiresAuth: true
        )
    }

    func uploadProfileImage(imageData: Data) async throws -> String {
        guard let url = URL(string: "\(baseURL)/api/upload/image") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"

        // Add auth token
        guard let token = authToken else {
            throw APIError.unauthorized
        }
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        // Create multipart form data
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()

        // Add image data
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"profile.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n".data(using: .utf8)!)
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            print("❌ Invalid HTTP response")
            throw APIError.invalidResponse
        }

        print("📊 Upload response status: \(httpResponse.statusCode)")

        guard (200...299).contains(httpResponse.statusCode) else {
            let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
            print("❌ Upload failed with status \(httpResponse.statusCode): \(errorMessage)")
            throw APIError.httpError(statusCode: httpResponse.statusCode, message: errorMessage)
        }

        struct UploadResponse: Codable {
            let url: String
        }

        let uploadResponse = try JSONDecoder().decode(UploadResponse.self, from: data)
        print("✅ Image uploaded successfully: \(uploadResponse.url)")
        return uploadResponse.url
    }

    // MARK: - Events API

    func getEvents(status: String = "active", upcoming: Bool = true) async throws -> [Event] {
        var endpoint = "\(Config.Endpoint.events)?status=\(status)"
        if upcoming {
            endpoint += "&upcoming=true"
        }
        return try await request(endpoint: endpoint)
    }

    func getMyTeamEvents(upcoming: Bool = true) async throws -> [TeamEvent] {
        var endpoint = "/api/my-team-events"
        if upcoming {
            endpoint += "?upcoming=true"
        }
        return try await request(endpoint: endpoint, requiresAuth: true)
    }

    func getPublicTeamEvents(upcoming: Bool = true) async throws -> [TeamEvent] {
        var endpoint = "/api/public-team-events"
        if upcoming {
            endpoint += "?upcoming=true"
        }
        return try await request(endpoint: endpoint, requiresAuth: false)
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

    // MARK: - Teams API

    func getTeams(search: String? = nil, region: String? = nil, myTeams: Bool = false) async throws -> [Team] {
        var endpoint = "/api/teams?"
        if myTeams {
            endpoint += "myTeams=true&"
        }
        if let search = search, !search.isEmpty {
            endpoint += "search=\(search.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&"
        }
        if let region = region, !region.isEmpty {
            endpoint += "region=\(region.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&"
        }
        return try await request(endpoint: String(endpoint.dropLast()))
    }

    func getTeam(id: String) async throws -> Team {
        return try await request(endpoint: "/api/teams/\(id)", requiresAuth: true)
    }

    func getUserTeams(userId: String) async throws -> [Team] {
        return try await request(endpoint: "/api/users/\(userId)/teams", requiresAuth: false)
    }

    func createTeam(request: CreateTeamRequest) async throws -> Team {
        return try await self.request(
            endpoint: "/api/teams",
            method: "POST",
            body: request,
            requiresAuth: true
        )
    }

    func updateTeam(id: String, request: UpdateTeamRequest) async throws -> Team {
        return try await self.request(
            endpoint: "/api/teams/\(id)",
            method: "PATCH",
            body: request,
            requiresAuth: true
        )
    }

    func deleteTeam(id: String) async throws {
        struct EmptyResponse: Codable {}
        let _: EmptyResponse = try await request(
            endpoint: "/api/teams/\(id)",
            method: "DELETE",
            requiresAuth: true
        )
    }

    // MARK: - Team Members API

    func getTeamMembers(teamId: String) async throws -> [TeamMember] {
        return try await request(
            endpoint: "/api/teams/\(teamId)/members",
            requiresAuth: true
        )
    }

    func updateMemberRole(teamId: String, userId: String, role: String) async throws -> TeamMember {
        let requestBody = UpdateMemberRoleRequest(role: role)
        return try await request(
            endpoint: "/api/teams/\(teamId)/members/\(userId)",
            method: "PATCH",
            body: requestBody,
            requiresAuth: true
        )
    }

    func removeMember(teamId: String, userId: String) async throws {
        struct EmptyResponse: Codable { let message: String }
        let _: EmptyResponse = try await request(
            endpoint: "/api/teams/\(teamId)/members/\(userId)",
            method: "DELETE",
            requiresAuth: true
        )
    }

    func leaveTeam(teamId: String, userId: String) async throws {
        try await removeMember(teamId: teamId, userId: userId)
    }

    // MARK: - Team Join Requests API

    func getTeamJoinRequests(teamId: String) async throws -> [TeamJoinRequest] {
        return try await request(
            endpoint: "/api/teams/\(teamId)/join-requests",
            requiresAuth: true
        )
    }

    func requestToJoinTeam(teamId: String) async throws -> TeamJoinRequest {
        return try await request(
            endpoint: "/api/teams/\(teamId)/join-requests",
            method: "POST",
            requiresAuth: true
        )
    }

    func approveJoinRequest(teamId: String, requestId: String, action: String) async throws {
        struct Response: Codable { let message: String; let status: String }
        let requestBody = ApproveJoinRequestRequest(action: action)
        let _: Response = try await request(
            endpoint: "/api/teams/\(teamId)/join-requests/\(requestId)",
            method: "PATCH",
            body: requestBody,
            requiresAuth: true
        )
    }

    // MARK: - Team Invite URLs API

    func generateTeamInvite(teamId: String) async throws -> TeamInviteUrl {
        return try await request(
            endpoint: "/api/teams/\(teamId)/invites",
            method: "POST",
            requiresAuth: true
        )
    }

    func getTeamInvites(teamId: String) async throws -> [TeamInviteUrl] {
        return try await request(
            endpoint: "/api/teams/\(teamId)/invites",
            requiresAuth: true
        )
    }

    func validateInvite(token: String) async throws -> ValidateInviteResponse {
        return try await request(endpoint: "/api/teams/invites/\(token)")
    }

    func useInvite(token: String) async throws {
        struct Response: Codable { let message: String }
        let _: Response = try await request(
            endpoint: "/api/teams/invites/\(token)",
            method: "POST",
            requiresAuth: true
        )
    }

    // MARK: - Team Events API

    func getTeamEvents(teamId: String) async throws -> [TeamEvent] {
        return try await request(
            endpoint: "/api/teams/\(teamId)/events",
            requiresAuth: true
        )
    }

    func getTeamEvent(teamId: String, eventId: String) async throws -> TeamEvent {
        return try await request(
            endpoint: "/api/teams/\(teamId)/events/\(eventId)",
            requiresAuth: true
        )
    }

    func createTeamEvent(teamId: String, request: CreateTeamEventRequest) async throws -> TeamEvent {
        return try await self.request(
            endpoint: "/api/teams/\(teamId)/events",
            method: "POST",
            body: request,
            requiresAuth: true
        )
    }

    func updateTeamEvent(teamId: String, eventId: String, request: UpdateTeamEventRequest) async throws -> TeamEvent {
        return try await self.request(
            endpoint: "/api/teams/\(teamId)/events/\(eventId)",
            method: "PATCH",
            body: request,
            requiresAuth: true
        )
    }

    func deleteTeamEvent(teamId: String, eventId: String) async throws {
        struct EmptyResponse: Codable { let message: String }
        let _: EmptyResponse = try await request(
            endpoint: "/api/teams/\(teamId)/events/\(eventId)",
            method: "DELETE",
            requiresAuth: true
        )
    }

    func joinTeamEvent(teamId: String, eventId: String) async throws {
        struct Response: Codable { let message: String }
        let _: Response = try await request(
            endpoint: "/api/teams/\(teamId)/events/\(eventId)/join",
            method: "POST",
            requiresAuth: true
        )
    }

    func leaveTeamEvent(teamId: String, eventId: String) async throws {
        struct Response: Codable { let message: String }
        let _: Response = try await request(
            endpoint: "/api/teams/\(teamId)/events/\(eventId)/join",
            method: "DELETE",
            requiresAuth: true
        )
    }

    // MARK: - Team Chat API

    func getTeamChatRoom(teamId: String) async throws -> TeamChatRoom {
        return try await request(
            endpoint: "/api/teams/\(teamId)/chat",
            requiresAuth: true
        )
    }

    func sendTeamMessage(teamId: String, content: String) async throws -> TeamMessage {
        let requestBody = SendTeamMessageRequest(content: content)
        return try await request(
            endpoint: "/api/teams/\(teamId)/chat",
            method: "POST",
            body: requestBody,
            requiresAuth: true
        )
    }

    // MARK: - Notifications API

    func getNotifications() async throws -> NotificationsResponse {
        return try await request(
            endpoint: "/api/notifications",
            requiresAuth: true
        )
    }

    func markNotificationAsRead(notificationId: String) async throws {
        struct Response: Codable { let message: String }
        let _: Response = try await request(
            endpoint: "/api/notifications/\(notificationId)/read",
            method: "PATCH",
            requiresAuth: true
        )
    }

    func markAllNotificationsAsRead() async throws {
        struct Response: Codable { let message: String }
        let _: Response = try await request(
            endpoint: "/api/notifications/read-all",
            method: "PATCH",
            requiresAuth: true
        )
    }

    func deleteNotification(notificationId: String) async throws {
        struct Response: Codable { let message: String }
        let _: Response = try await request(
            endpoint: "/api/notifications/\(notificationId)",
            method: "DELETE",
            requiresAuth: true
        )
    }
}
