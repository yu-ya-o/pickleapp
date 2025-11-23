import Foundation
import SwiftUI

@MainActor
class TeamsViewModel: ObservableObject {
    @Published var publicTeams: [Team] = []
    @Published var myTeams: [Team] = []
    @Published var searchText = ""
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let apiClient = APIClient.shared
    private var searchTask: Task<Void, Never>?

    // MARK: - Fetch Teams

    func fetchPublicTeams(region: String = "") async {
        isLoading = true
        errorMessage = nil

        do {
            publicTeams = try await apiClient.getTeams(search: searchText, region: region.isEmpty ? nil : region, myTeams: false)
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("Fetch public teams error: \(error)")
        }
    }

    func fetchMyTeams() async {
        errorMessage = nil

        do {
            myTeams = try await apiClient.getTeams(myTeams: true)
        } catch {
            errorMessage = error.localizedDescription
            print("Fetch my teams error: \(error)")
        }
    }

    func searchTeams(query: String) {
        searchText = query
        searchTask?.cancel()

        searchTask = Task {
            try? await Task.sleep(nanoseconds: 300_000_000) // 300ms debounce
            if !Task.isCancelled {
                await fetchPublicTeams()
            }
        }
    }

    func refresh() async {
        await fetchMyTeams()
        await fetchPublicTeams()
    }

    // MARK: - Create Team

    func createTeam(
        name: String,
        description: String,
        region: String? = nil,
        visibility: String,
        iconImage: String? = nil
    ) async throws {
        isLoading = true
        errorMessage = nil

        let request = CreateTeamRequest(
            name: name,
            description: description,
            iconImage: iconImage,
            region: region,
            visibility: visibility,
            instagramUrl: nil,
            twitterUrl: nil,
            tiktokUrl: nil,
            lineUrl: nil
        )

        do {
            let newTeam = try await apiClient.createTeam(request: request)
            myTeams.insert(newTeam, at: 0)
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            throw error
        }
    }

    // MARK: - Delete Team

    func deleteTeam(id: String) async throws {
        do {
            try await apiClient.deleteTeam(id: id)
            myTeams.removeAll { $0.id == id }
            publicTeams.removeAll { $0.id == id }
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }

    // MARK: - Join Request

    func requestToJoinTeam(teamId: String) async throws {
        do {
            _ = try await apiClient.requestToJoinTeam(teamId: teamId)
            // Refresh to update membership status
            await refresh()
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
}
