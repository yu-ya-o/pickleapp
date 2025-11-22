import SwiftUI

struct TeamMembersView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: TeamDetailViewModel
    @EnvironmentObject var authViewModel: AuthViewModel

    @State private var selectedMember: TeamMember?
    @State private var showingRoleChange = false
    @State private var showingRemoveAlert = false

    var body: some View {
        NavigationView {
            List {
                ForEach(viewModel.members) { member in
                    HStack(spacing: 12) {
                        Image(systemName: "person.circle.fill")
                            .font(.title2)
                            .foregroundColor(.blue)

                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(member.user.displayName)
                                    .font(.headline)

                                if member.user.id == authViewModel.currentUser?.id {
                                    Text("(You)")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }

                            HStack {
                                Text(member.roleDisplay)
                                    .font(.caption)
                                    .foregroundColor(.secondary)

                                Text("•")
                                    .foregroundColor(.secondary)

                                if let date = member.joinedDate {
                                    Text("Joined \(date, style: .date)")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }

                        Spacer()

                        if member.role == "owner" {
                            Image(systemName: "crown.fill")
                                .foregroundColor(.yellow)
                        } else if member.role == "admin" {
                            Image(systemName: "shield.fill")
                                .foregroundColor(.orange)
                        }
                    }
                    .padding(.vertical, 4)
                    .contentShape(Rectangle())
                    .onTapGesture {
                        if viewModel.isOwner && member.role != "owner" {
                            selectedMember = member
                            showingRoleChange = true
                        }
                    }
                    .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                        if canRemoveMember(member) {
                            Button(role: .destructive) {
                                selectedMember = member
                                showingRemoveAlert = true
                            } label: {
                                Label("Remove", systemImage: "person.badge.minus")
                            }
                        }
                    }
                }
            }
            .navigationTitle("Members (\(viewModel.members.count))")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .confirmationDialog(
                "Change Role",
                isPresented: $showingRoleChange,
                presenting: selectedMember
            ) { member in
                if member.role == "member" {
                    Button("Promote to Admin") {
                        changeRole(member: member, newRole: "admin")
                    }
                } else if member.role == "admin" {
                    Button("Demote to Member") {
                        changeRole(member: member, newRole: "member")
                    }
                }

                Button("Cancel", role: .cancel) {}
            } message: { member in
                Text("Change role for \(member.user.displayName)?")
            }
            .alert("Remove Member", isPresented: $showingRemoveAlert, presenting: selectedMember) { member in
                Button("Cancel", role: .cancel) {}
                Button("Remove", role: .destructive) {
                    removeMember(member)
                }
            } message: { member in
                Text("Remove \(member.user.displayName) from the team?")
            }
        }
    }

    private func canRemoveMember(_ member: TeamMember) -> Bool {
        // Owner can remove anyone except themselves
        if viewModel.isOwner {
            return member.role != "owner"
        }

        // Admin can remove regular members
        if viewModel.isAdmin {
            return member.role == "member"
        }

        return false
    }

    private func changeRole(member: TeamMember, newRole: String) {
        Task {
            do {
                try await viewModel.updateMemberRole(userId: member.user.id, role: newRole)
            } catch {
                // Handle error
                print("Error changing role: \(error)")
            }
        }
    }

    private func removeMember(_ member: TeamMember) {
        Task {
            do {
                try await viewModel.removeMember(userId: member.user.id)
            } catch {
                // Handle error
                print("Error removing member: \(error)")
            }
        }
    }
}
