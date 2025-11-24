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
                                Text("新しい招待リンクを生成")
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                        }
                    }

                    if !viewModel.invites.isEmpty {
                        Section(header: Text("有効な招待")) {
                            ForEach(viewModel.invites.filter { $0.isValid }) { invite in
                                InviteRowView(invite: invite) {
                                    shareInvite(invite)
                                }
                            }
                        }

                        if viewModel.invites.contains(where: { !$0.isValid }) {
                            Section(header: Text("期限切れ/使用済み招待")) {
                                ForEach(viewModel.invites.filter { !$0.isValid }) { invite in
                                    InviteRowView(invite: invite, isActive: false)
                                }
                            }
                        }
                    }
                }
                .listStyle(.insetGrouped)
            }
            .navigationTitle("招待リンク")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("完了") {
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
            .alert("招待リンク生成完了", isPresented: $showingGenerateConfirmation) {
                Button("OK", role: .cancel) {}
            } message: {
                Text("新しい招待リンクが作成されました。24時間後に期限切れとなり、1回のみ使用できます。")
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
                        Label("期限切れ", systemImage: "clock.badge.xmark")
                            .font(.caption)
                            .foregroundColor(.red)
                    } else if invite.isUsed {
                        Label("使用済み", systemImage: "checkmark.circle")
                            .font(.caption)
                            .foregroundColor(.green)
                    } else {
                        Label("有効", systemImage: "checkmark.circle.fill")
                            .font(.caption)
                            .foregroundColor(.green)
                    }

                    if let expiresDate = invite.expiresDate {
                        Text("期限: \(expiresDate, style: .relative)")
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
                    Text("使用者: \(usedBy.name)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Text("作成者: \(invite.createdBy.name)")
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
