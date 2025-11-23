import SwiftUI

struct TeamMembersView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: TeamDetailViewModel
    @EnvironmentObject var authViewModel: AuthViewModel

    @State private var selectedMember: TeamMember?
    @State private var showingRoleChange = false
    @State private var showingRemoveAlert = false
    @State private var showingOwnershipTransferAlert = false
    @State private var memberToPromoteToOwner: TeamMember?
    @State private var selectedUser: User?
    @State private var showingUserProfile = false

    var body: some View {
        NavigationView {
            List {
                ForEach(viewModel.members) { member in
                    HStack(spacing: 12) {
                        // Tappable Profile Image
                        Button(action: {
                            selectedUser = member.user
                            showingUserProfile = true
                        }) {
                            if let profileImageURL = member.user.profileImageURL {
                                AsyncImage(url: profileImageURL) { phase in
                                    switch phase {
                                    case .success(let image):
                                        image
                                            .resizable()
                                            .scaledToFill()
                                            .frame(width: 50, height: 50)
                                            .clipShape(Circle())
                                    case .failure(_), .empty:
                                        Image(systemName: "person.circle.fill")
                                            .resizable()
                                            .frame(width: 50, height: 50)
                                            .foregroundColor(.blue)
                                    @unknown default:
                                        EmptyView()
                                    }
                                }
                            } else {
                                Image(systemName: "person.circle.fill")
                                    .resizable()
                                    .frame(width: 50, height: 50)
                                    .foregroundColor(.blue)
                            }
                        }
                        .buttonStyle(.plain)

                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(member.user.displayName)
                                    .font(.headline)

                                if member.user.id == authViewModel.currentUser?.id {
                                    Text("(あなた)")
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
                                    Text("参加日: \(date, style: .date)")
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
                        if canChangeRole(member) {
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
                                Label("削除", systemImage: "person.badge.minus")
                            }
                        }
                    }
                }
            }
            .navigationTitle("メンバー (\(viewModel.members.count))")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("完了") {
                        dismiss()
                    }
                }
            }
            .confirmationDialog(
                "役割を変更",
                isPresented: $showingRoleChange,
                presenting: selectedMember
            ) { member in
                // Owner can do everything
                if viewModel.isOwner {
                    if member.role == "member" {
                        Button("管理者に昇格") {
                            changeRole(member: member, newRole: "admin")
                        }
                        Button("オーナーに昇格") {
                            memberToPromoteToOwner = member
                            showingOwnershipTransferAlert = true
                        }
                    } else if member.role == "admin" {
                        Button("オーナーに昇格") {
                            memberToPromoteToOwner = member
                            showingOwnershipTransferAlert = true
                        }
                        Button("メンバーに降格") {
                            changeRole(member: member, newRole: "member")
                        }
                    }
                }
                // Admin can only change admin and member roles
                else if viewModel.isAdmin {
                    if member.role == "member" {
                        Button("管理者に昇格") {
                            changeRole(member: member, newRole: "admin")
                        }
                    } else if member.role == "admin" {
                        Button("メンバーに降格") {
                            changeRole(member: member, newRole: "member")
                        }
                    }
                }

                Button("キャンセル", role: .cancel) {}
            } message: { member in
                Text("\(member.user.displayName)の役割を変更しますか？")
            }
            .alert("メンバーを削除", isPresented: $showingRemoveAlert, presenting: selectedMember) { member in
                Button("キャンセル", role: .cancel) {}
                Button("削除", role: .destructive) {
                    removeMember(member)
                }
            } message: { member in
                Text("\(member.user.displayName)をチームから削除しますか？")
            }
            .alert("オーナー権限を譲渡", isPresented: $showingOwnershipTransferAlert, presenting: memberToPromoteToOwner) { member in
                Button("キャンセル", role: .cancel) {}
                Button("譲渡", role: .destructive) {
                    changeRole(member: member, newRole: "owner")
                }
            } message: { member in
                Text("\(member.user.displayName)にオーナー権限を譲渡しますか？あなたは管理者になります。")
            }
            .sheet(isPresented: $showingUserProfile) {
                if let user = selectedUser {
                    UserProfileView(user: user)
                }
            }
        }
    }

    private func canChangeRole(_ member: TeamMember) -> Bool {
        // Owner can change any role except their own
        if viewModel.isOwner {
            return member.role != "owner"
        }

        // Admin can change admin and member roles (not owner)
        if viewModel.isAdmin {
            return member.role != "owner"
        }

        // Members cannot change roles
        return false
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
                // Refresh team data to reflect changes (especially for ownership transfer)
                await viewModel.loadTeam()
                await viewModel.loadMembers()
            } catch {
                // Handle error
                print("Error changing role: \(error)")
                viewModel.errorMessage = error.localizedDescription
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
