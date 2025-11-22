import SwiftUI

struct JoinRequestsView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: TeamDetailViewModel

    var body: some View {
        NavigationView {
            Group {
                if viewModel.joinRequests.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "person.crop.circle.badge.checkmark")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        Text("No Pending Requests")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text("Join requests will appear here")
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
                                    approveRequest(request.id, approve: true)
                                },
                                onReject: {
                                    approveRequest(request.id, approve: false)
                                }
                            )
                        }
                    }
                }
            }
            .navigationTitle("Join Requests")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .refreshable {
                await viewModel.loadJoinRequests()
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

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                Image(systemName: "person.circle.fill")
                    .font(.title2)
                    .foregroundColor(.blue)

                VStack(alignment: .leading, spacing: 4) {
                    Text(request.user.name)
                        .font(.headline)

                    Text(request.user.email)
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    Text("Requested \(request.formattedDate)")
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
                    Text("Reject")
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
                    Text("Approve")
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
