import SwiftUI

struct TeamChatView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel

    @State private var messages: [TeamMessage] = []
    @State private var messageText = ""
    @State private var isLoading = false
    @State private var errorMessage: String?

    let teamId: String
    let teamName: String

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Messages
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            if messages.isEmpty && !isLoading {
                                VStack(spacing: 20) {
                                    Image(systemName: "message")
                                        .font(.system(size: 60))
                                        .foregroundColor(.gray)
                                    Text("No messages yet")
                                        .font(.headline)
                                        .foregroundColor(.secondary)
                                    Text("Be the first to send a message!")
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                                .frame(maxWidth: .infinity, maxHeight: .infinity)
                                .padding()
                            } else {
                                ForEach(messages) { message in
                                    TeamMessageBubbleView(
                                        message: message,
                                        isCurrentUser: message.user.id == authViewModel.currentUser?.id
                                    )
                                    .id(message.id)
                                }
                            }
                        }
                        .padding()
                    }
                    .onChange(of: messages.count) { _, _ in
                        scrollToBottom(proxy: proxy)
                    }
                }

                // Input area
                HStack(spacing: 12) {
                    TextField("Type a message...", text: $messageText, axis: .vertical)
                        .textFieldStyle(.roundedBorder)
                        .lineLimit(1...4)

                    Button(action: sendMessage) {
                        Image(systemName: "paperplane.fill")
                            .foregroundColor(.white)
                            .padding(10)
                            .background(messageText.isEmpty ? Color.gray : Color.blue)
                            .clipShape(Circle())
                    }
                    .disabled(messageText.isEmpty)
                }
                .padding()
                .background(Color(.systemBackground))
            }
            .navigationTitle(teamName)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .task {
                await loadMessages()
            }
        }
    }

    private func loadMessages() async {
        isLoading = true
        errorMessage = nil

        do {
            let chatRoom = try await APIClient.shared.getTeamChatRoom(teamId: teamId)
            messages = chatRoom.messages
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("Load team chat error: \(error)")
        }
    }

    private func sendMessage() {
        let text = messageText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        Task {
            do {
                let newMessage = try await APIClient.shared.sendTeamMessage(teamId: teamId, content: text)
                messages.append(newMessage)
                messageText = ""
            } catch {
                errorMessage = error.localizedDescription
                print("Send message error: \(error)")
            }
        }
    }

    private func scrollToBottom(proxy: ScrollViewProxy) {
        guard let lastMessage = messages.last else { return }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            withAnimation {
                proxy.scrollTo(lastMessage.id, anchor: .bottom)
            }
        }
    }
}

struct TeamMessageBubbleView: View {
    let message: TeamMessage
    let isCurrentUser: Bool

    var body: some View {
        HStack {
            if isCurrentUser {
                Spacer()
            }

            VStack(alignment: isCurrentUser ? .trailing : .leading, spacing: 4) {
                if !isCurrentUser {
                    Text(message.user.displayName)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Text(message.content)
                    .padding(12)
                    .background(isCurrentUser ? Color.blue : Color(.systemGray5))
                    .foregroundColor(isCurrentUser ? .white : .primary)
                    .cornerRadius(16)

                Text(message.formattedTime)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            if !isCurrentUser {
                Spacer()
            }
        }
    }
}

#Preview {
    TeamChatView(teamId: "test", teamName: "Test Team")
        .environmentObject(AuthViewModel())
}
