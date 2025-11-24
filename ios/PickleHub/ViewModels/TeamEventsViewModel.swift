import Foundation
import SwiftUI

@MainActor
class TeamEventsViewModel: ObservableObject {
    @Published var events: [TeamEvent] = []
    @Published var team: Team?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let apiClient = APIClient.shared
    let teamId: String

    init(teamId: String) {
        self.teamId = teamId
    }

    var canCreateEvents: Bool {
        guard let role = team?.userRole else { return false }
        return ["owner", "admin"].contains(role)
    }

    // MARK: - Load Team

    func loadTeam() async {
        do {
            team = try await apiClient.getTeam(id: teamId)
        } catch {
            errorMessage = error.localizedDescription
            print("Load team error: \(error)")
        }
    }

    // MARK: - Load Events

    func loadEvents() async {
        isLoading = true
        errorMessage = nil

        do {
            events = try await apiClient.getTeamEvents(teamId: teamId)
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("Load team events error: \(error)")
        }
    }

    func refresh() async {
        await loadTeam()
        await loadEvents()
    }

    // MARK: - Create Event

    func createEvent(
        title: String,
        description: String,
        location: String,
        region: String? = nil,
        startTime: Date,
        endTime: Date,
        maxParticipants: Int?,
        skillLevel: String? = nil,
        visibility: String = "private"
    ) async throws {
        isLoading = true
        errorMessage = nil

        let formatter = ISO8601DateFormatter()

        let request = CreateTeamEventRequest(
            title: title,
            description: description,
            location: location,
            region: region,
            startTime: formatter.string(from: startTime),
            endTime: formatter.string(from: endTime),
            maxParticipants: maxParticipants,
            price: nil,
            skillLevel: skillLevel,
            visibility: visibility
        )

        do {
            let newEvent = try await apiClient.createTeamEvent(teamId: teamId, request: request)
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
        eventId: String,
        title: String? = nil,
        description: String? = nil,
        location: String? = nil,
        region: String? = nil,
        startTime: Date? = nil,
        endTime: Date? = nil,
        maxParticipants: Int? = nil,
        status: String? = nil,
        visibility: String? = nil
    ) async throws {
        let formatter = ISO8601DateFormatter()

        let request = UpdateTeamEventRequest(
            title: title,
            description: description,
            location: location,
            region: region,
            startTime: startTime.map { formatter.string(from: $0) },
            endTime: endTime.map { formatter.string(from: $0) },
            maxParticipants: maxParticipants,
            price: nil,
            status: status,
            visibility: visibility
        )

        do {
            let updatedEvent = try await apiClient.updateTeamEvent(
                teamId: teamId,
                eventId: eventId,
                request: request
            )

            if let index = events.firstIndex(where: { $0.id == eventId }) {
                events[index] = updatedEvent
            }
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }

    // MARK: - Delete Event

    func deleteEvent(eventId: String) async throws {
        do {
            try await apiClient.deleteTeamEvent(teamId: teamId, eventId: eventId)
            events.removeAll { $0.id == eventId }
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }

    // MARK: - Join/Leave Event

    func joinEvent(eventId: String) async throws {
        do {
            try await apiClient.joinTeamEvent(teamId: teamId, eventId: eventId)
            await loadEvents() // Refresh to update participation
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }

    func leaveEvent(eventId: String) async throws {
        do {
            try await apiClient.leaveTeamEvent(teamId: teamId, eventId: eventId)
            await loadEvents() // Refresh to update participation
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
}
