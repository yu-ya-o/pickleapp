import Foundation
import SwiftUI

@MainActor
class TeamDetailViewModel: ObservableObject {
    @Published var team: Team?
    @Published var members: [TeamMember] = []
    @Published var joinRequests: [TeamJoinRequest] = []
    @Published var invites: [TeamInviteUrl] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var hasPendingJoinRequest = false

    private let apiClient = APIClient.shared
    let teamId: String

    init(teamId: String) {
        self.teamId = teamId
    }

    // MARK: - Load Team

    func loadTeam() async {
        isLoading = true
        errorMessage = nil

        do {
            team = try await apiClient.getTeam(id: teamId)
            if let team = team {
                if let members = team.members {
                    self.members = members
                }
                // Update pending join request status from server
                hasPendingJoinRequest = team.hasPendingJoinRequest ?? false
            }
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("Load team error: \(error)")
        }
    }

    func refresh() async {
        await loadTeam()
        if canManageTeam {
            await loadJoinRequests()
        }
    }

    // MARK: - Update Team

    func updateTeam(
        name: String? = nil,
        description: String? = nil,
        region: String? = nil,
        visibility: String? = nil,
        iconImage: String? = nil
    ) async throws {
        let request = UpdateTeamRequest(
            name: name,
            description: description,
            iconImage: iconImage,
            region: region,
            visibility: visibility
        )

        do {
            team = try await apiClient.updateTeam(id: teamId, request: request)
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }

    // MARK: - Members

    func loadMembers() async {
        do {
            members = try await apiClient.getTeamMembers(teamId: teamId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func updateMemberRole(userId: String, role: String) async throws {
        do {
            let updatedMember = try await apiClient.updateMemberRole(
                teamId: teamId,
                userId: userId,
                role: role
            )

            // Update local members list
            if let index = members.firstIndex(where: { $0.user.id == userId }) {
                members[index] = updatedMember
            }
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }

    func removeMember(userId: String) async throws {
        do {
            try await apiClient.removeMember(teamId: teamId, userId: userId)
            members.removeAll { $0.user.id == userId }
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }

    func leaveTeam(userId: String) async throws {
        try await removeMember(userId: userId)
    }

    // MARK: - Join Requests

    func loadJoinRequests() async {
        guard canManageTeam else {
            print("⚠️ Cannot load join requests - user is not team manager")
            return
        }

        print("🔍 Loading join requests for team: \(teamId)")
        do {
            joinRequests = try await apiClient.getTeamJoinRequests(teamId: teamId)
            print("✅ Loaded \(joinRequests.count) join requests")
            if joinRequests.isEmpty {
                print("📭 No pending join requests found")
            } else {
                for request in joinRequests {
                    print("   - Request from: \(request.user.name) (\(request.user.email)) - Status: \(request.status)")
                }
            }
        } catch {
            print("❌ Error loading join requests: \(error)")
            errorMessage = error.localizedDescription
        }
    }

    func requestToJoin() async throws {
        print("🎯 Requesting to join team: \(teamId)")
        do {
            let joinRequest = try await apiClient.requestToJoinTeam(teamId: teamId)
            print("✅ Join request created: \(joinRequest.id)")
            hasPendingJoinRequest = true
            // Refresh team to update membership status
            await loadTeam()
            print("🔄 Team refreshed after join request")
        } catch {
            print("❌ Request to join error: \(error)")
            errorMessage = error.localizedDescription
            throw error
        }
    }

    func approveJoinRequest(requestId: String, approve: Bool) async throws {
        let action = approve ? "approve" : "reject"

        print("📝 Processing join request: \(requestId)")
        print("   Approve: \(approve), Action: \(action)")

        do {
            try await apiClient.approveJoinRequest(
                teamId: teamId,
                requestId: requestId,
                action: action
            )

            print("✅ Join request processed successfully")
            joinRequests.removeAll { $0.id == requestId }

            if approve {
                await loadMembers()
            }
        } catch {
            print("❌ Error approving/rejecting join request: \(error)")
            errorMessage = error.localizedDescription
            throw error
        }
    }

    // MARK: - Invite URLs

    func loadInvites() async {
        guard canManageTeam else { return }

        do {
            invites = try await apiClient.getTeamInvites(teamId: teamId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func generateInvite() async throws -> TeamInviteUrl {
        do {
            let invite = try await apiClient.generateTeamInvite(teamId: teamId)
            invites.insert(invite, at: 0)
            return invite
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }

    // MARK: - Permissions

    var isOwner: Bool {
        team?.userRole == "owner"
    }

    var isAdmin: Bool {
        team?.userRole == "admin"
    }

    var isMember: Bool {
        team?.isUserMember == true
    }

    var canManageTeam: Bool {
        isOwner || isAdmin
    }

    var canEditSettings: Bool {
        canManageTeam
    }

    var canDeleteTeam: Bool {
        isOwner
    }

    var canGenerateInvites: Bool {
        canManageTeam
    }
}
