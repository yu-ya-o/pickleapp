import SwiftUI

struct JoinRequestsView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: TeamDetailViewModel
    @State private var showingApproveConfirm = false
    @State private var showingRejectConfirm = false
    @State private var selectedRequest: TeamJoinRequest?
    @State private var selectedUser: User?
    @State private var showingUserProfile = false

    var body: some View {
        NavigationView {
            Group {
                if viewModel.joinRequests.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "person.crop.circle.badge.checkmark")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        Text("保留中のリクエストはありません")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text("参加リクエストがここに表示されます")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List {
                        ForEach(viewModel.joinRequests) { request in
                            JoinRequestRow(
                                request: request,
                                onApprove: {
                                    selectedRequest = request
                                    showingApproveConfirm = true
                                },
                                onReject: {
                                    selectedRequest = request
                                    showingRejectConfirm = true
                                },
                                onProfileTap: {
                                    selectedUser = request.user
                                    showingUserProfile = true
                                }
                            )
                        }
                    }
                }
            }
            .navigationTitle("参加リクエスト")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("完了") {
                        dismiss()
                    }
                }
            }
            .refreshable {
                await viewModel.loadJoinRequests()
            }
            .alert("参加リクエストを承認", isPresented: $showingApproveConfirm) {
                Button("キャンセル", role: .cancel) {}
                Button("承認") {
                    if let request = selectedRequest {
                        approveRequest(request.id, approve: true)
                    }
                }
            } message: {
                if let request = selectedRequest {
                    Text("\(request.user.displayName)の参加リクエストを承認しますか?")
                }
            }
            .alert("参加リクエストを拒否", isPresented: $showingRejectConfirm) {
                Button("キャンセル", role: .cancel) {}
                Button("拒否", role: .destructive) {
                    if let request = selectedRequest {
                        approveRequest(request.id, approve: false)
                    }
                }
            } message: {
                if let request = selectedRequest {
                    Text("\(request.user.displayName)の参加リクエストを拒否しますか?")
                }
            }
            .sheet(isPresented: $showingUserProfile) {
                if let user = selectedUser {
                    UserProfileView(user: user)
                }
            }
        }
    }

    private func approveRequest(_ requestId: String, approve: Bool) {
        Task {
            do {
                try await viewModel.approveJoinRequest(requestId: requestId, approve: approve)
            } catch {
                print("Error processing join request: \(error)")
            }
        }
    }
}

struct JoinRequestRow: View {
    let request: TeamJoinRequest
    let onApprove: () -> Void
    let onReject: () -> Void
    let onProfileTap: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                // Tappable Profile Image
                ProfileImageView(url: request.user.profileImageURL, size: 50)
                    .onTapGesture {
                        onProfileTap()
                    }

                VStack(alignment: .leading, spacing: 4) {
                    Text(request.user.displayName)
                        .font(.headline)

                    Text("リクエスト日: \(request.formattedDate)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()
            }

            HStack(spacing: 12) {
                Button(action: {
                    print("🔴 Reject button tapped")
                    onReject()
                }) {
                    Text("拒否")
                        .fontWeight(.semibold)
                        .foregroundColor(.red)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(8)
                }
                .buttonStyle(.plain)

                Button(action: {
                    print("🟢 Approve button tapped")
                    onApprove()
                }) {
                    Text("承認")
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(Color.green)
                        .cornerRadius(8)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    JoinRequestsView(viewModel: TeamDetailViewModel(teamId: "test"))
}
