import SwiftUI

struct InviteManagementView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: TeamDetailViewModel

    @State private var showingShareSheet = false
    @State private var inviteToShare: TeamInviteUrl?
    @State private var showingGenerateConfirmation = false

    var body: some View {
        NavigationView {
            VStack {
                List {
                    Section {
                        Button(action: generateInvite) {
                            HStack {
                                Image(systemName: "plus.circle.fill")
                                    .foregroundColor(.blue)
                                Text("Generate New Invite Link")
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                        }
                    }

                    if !viewModel.invites.isEmpty {
                        Section(header: Text("Active Invites")) {
                            ForEach(viewModel.invites.filter { $0.isValid }) { invite in
                                InviteRowView(invite: invite) {
                                    shareInvite(invite)
                                }
                            }
                        }

                        if viewModel.invites.contains(where: { !$0.isValid }) {
                            Section(header: Text("Expired/Used Invites")) {
                                ForEach(viewModel.invites.filter { !$0.isValid }) { invite in
                                    InviteRowView(invite: invite, isActive: false)
                                }
                            }
                        }
                    }
                }
                .listStyle(.insetGrouped)
            }
            .navigationTitle("Invite Links")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .refreshable {
                await viewModel.loadInvites()
            }
            .sheet(isPresented: $showingShareSheet) {
                if let invite = inviteToShare {
                    ShareSheet(items: [invite.inviteUrl])
                }
            }
            .alert("Invite Link Generated", isPresented: $showingGenerateConfirmation) {
                Button("OK", role: .cancel) {}
            } message: {
                Text("A new invite link has been created. It will expire in 24 hours and can only be used once.")
            }
        }
    }

    private func generateInvite() {
        Task {
            do {
                _ = try await viewModel.generateInvite()
                showingGenerateConfirmation = true
            } catch {
                print("Error generating invite: \(error)")
            }
        }
    }

    private func shareInvite(_ invite: TeamInviteUrl) {
        inviteToShare = invite
        showingShareSheet = true
    }
}

struct InviteRowView: View {
    let invite: TeamInviteUrl
    var isActive: Bool = true
    var onShare: (() -> Void)? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    if invite.isExpired {
                        Label("Expired", systemImage: "clock.badge.xmark")
                            .font(.caption)
                            .foregroundColor(.red)
                    } else if invite.isUsed {
                        Label("Used", systemImage: "checkmark.circle")
                            .font(.caption)
                            .foregroundColor(.green)
                    } else {
                        Label("Active", systemImage: "checkmark.circle.fill")
                            .font(.caption)
                            .foregroundColor(.green)
                    }

                    if let expiresDate = invite.expiresDate {
                        Text("Expires \(expiresDate, style: .relative)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()

                if isActive, let onShare = onShare {
                    Button(action: onShare) {
                        Image(systemName: "square.and.arrow.up")
                            .foregroundColor(.blue)
                    }
                }
            }

            if !isActive {
                if let usedBy = invite.usedBy {
                    Text("Used by: \(usedBy.name)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Text("Created by \(invite.createdBy.name)")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

// Share Sheet for iOS
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

#Preview {
    InviteManagementView(viewModel: TeamDetailViewModel(teamId: "test"))
}
