import Foundation
import SwiftUI

@MainActor
class EventsViewModel: ObservableObject {
    @Published var events: [Event] = []
    @Published var teamEvents: [TeamEvent] = []
    @Published var publicTeamEvents: [TeamEvent] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let apiClient = APIClient.shared

    // MARK: - Fetch Events

    func fetchEvents(upcoming: Bool = true) async {
        isLoading = true
        errorMessage = nil

        do {
            // Fetch both regular events and public team events
            async let regularEvents = apiClient.getEvents(status: "active", upcoming: upcoming)
            async let publicEvents = apiClient.getPublicTeamEvents(upcoming: upcoming)

            events = try await regularEvents
            let fetchedPublicTeamEvents = try await publicEvents

            // Filter to only include public visibility team events
            publicTeamEvents = fetchedPublicTeamEvents.filter { $0.visibility == "public" }

            print("✅ Fetched \(events.count) regular events and \(publicTeamEvents.count) public team events")
            print("📝 Regular Events: \(events.map { $0.title })")
            print("📝 Public Team Events: \(publicTeamEvents.map { $0.title })")
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("❌ Fetch events error: \(error)")
        }
    }

    func fetchTeamEvents(upcoming: Bool = true) async {
        isLoading = true
        errorMessage = nil

        do {
            teamEvents = try await apiClient.getMyTeamEvents(upcoming: upcoming)
            print("✅ Fetched \(teamEvents.count) team events")
            print("📝 Team Events: \(teamEvents.map { $0.title })")
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("❌ Fetch team events error: \(error)")
        }
    }

    func refreshEvents() async {
        await fetchEvents()
    }

    func refreshTeamEvents() async {
        await fetchTeamEvents()
    }

    // MARK: - Create Event

    func createEvent(
        title: String,
        description: String,
        location: String,
        region: String? = nil,
        startTime: Date,
        endTime: Date,
        maxParticipants: Int,
        skillLevel: String,
        price: Int? = nil
    ) async throws {
        isLoading = true
        errorMessage = nil

        let formatter = ISO8601DateFormatter()

        let request = CreateEventRequest(
            title: title,
            description: description,
            location: location,
            region: region,
            startTime: formatter.string(from: startTime),
            endTime: formatter.string(from: endTime),
            maxParticipants: maxParticipants,
            skillLevel: skillLevel,
            price: price
        )

        do {
            let newEvent = try await apiClient.createEvent(request: request)
            events.insert(newEvent, at: 0)
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            throw error
        }
    }

    // MARK: - Update Event

    func updateEvent(
        id: String,
        title: String? = nil,
        description: String? = nil,
        location: String? = nil,
        region: String? = nil,
        startTime: Date? = nil,
        endTime: Date? = nil,
        maxParticipants: Int? = nil,
        skillLevel: String? = nil,
        price: Int? = nil,
        status: String? = nil
    ) async throws {
        isLoading = true
        errorMessage = nil

        let formatter = ISO8601DateFormatter()

        let request = UpdateEventRequest(
            title: title,
            description: description,
            location: location,
            region: region,
            startTime: startTime.map { formatter.string(from: $0) },
            endTime: endTime.map { formatter.string(from: $0) },
            maxParticipants: maxParticipants,
            skillLevel: skillLevel,
            price: price,
            status: status
        )

        do {
            let updatedEvent = try await apiClient.updateEvent(id: id, request: request)

            // Update in list
            if let index = events.firstIndex(where: { $0.id == id }) {
                events[index] = updatedEvent
            }

            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            throw error
        }
    }

    // MARK: - Delete Event

    func deleteEvent(id: String) async throws {
        isLoading = true
        errorMessage = nil

        do {
            try await apiClient.deleteEvent(id: id)

            // Remove from list
            events.removeAll { $0.id == id }

            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            throw error
        }
    }

    // MARK: - Reservations

    func makeReservation(eventId: String) async throws {
        do {
            print("🎫 Creating reservation for event: \(eventId)")
            let reservation = try await apiClient.createReservation(eventId: eventId)
            print("✅ Reservation created: \(reservation.id)")

            // Refresh events to update reservation status
            print("🔄 Refreshing events after reservation...")
            await fetchEvents()
        } catch {
            print("❌ Make reservation error: \(error)")
            errorMessage = error.localizedDescription
            throw error
        }
    }

    func cancelReservation(reservationId: String) async throws {
        do {
            try await apiClient.cancelReservation(id: reservationId)

            // Refresh events to update reservation status
            await fetchEvents()
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
}
