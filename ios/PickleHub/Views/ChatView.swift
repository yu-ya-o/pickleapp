import SwiftUI

struct ChatView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel

    @State private var messages: [Message] = []
    @State private var messageText = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @FocusState private var isTextFieldFocused: Bool

    let eventId: String
    let eventTitle: String

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
                                    Text("まだメッセージがありません")
                                        .font(.headline)
                                        .foregroundColor(.secondary)
                                    Text("最初のメッセージを送信しましょう！")
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                                .frame(maxWidth: .infinity, maxHeight: .infinity)
                                .padding()
                            } else {
                                ForEach(messages) { message in
                                    MessageBubbleView(
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
                    TextField("メッセージを入力...", text: $messageText, axis: .vertical)
                        .textFieldStyle(.roundedBorder)
                        .lineLimit(1...4)
                        .focused($isTextFieldFocused)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)

                    Button(action: sendMessage) {
                        Image(systemName: "paperplane.fill")
                            .foregroundColor(.white)
                            .padding(10)
                            .background(messageText.isEmpty ? Color.gray : Color.twitterBlue)
                            .clipShape(Circle())
                    }
                    .disabled(messageText.isEmpty)
                }
                .padding()
                .background(Color(.systemBackground))
            }
            .navigationTitle(eventTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("完了") {
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
            let chatRoom = try await APIClient.shared.getChatRoom(eventId: eventId)
            messages = chatRoom.messages
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("Load event chat error: \(error)")
        }
    }

    private func sendMessage() {
        let text = messageText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        // Unfocus text field to reset internal state
        isTextFieldFocused = false

        // Clear text field immediately (already on main thread)
        messageText = ""

        Task {
            do {
                // Get chat room to get chatRoomId
                let chatRoom = try await APIClient.shared.getChatRoom(eventId: eventId)
                let newMessage = try await APIClient.shared.sendMessage(chatRoomId: chatRoom.id, content: text)
                await MainActor.run {
                    messages.append(newMessage)
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                }
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

struct MessageBubbleView: View {
    let message: Message
    let isCurrentUser: Bool

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            if isCurrentUser {
                Spacer()
            }

            // User icon for other users
            if !isCurrentUser {
                CachedAsyncImage(url: URL(string: message.user.profileImage ?? "")) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    Image(systemName: "person.circle.fill")
                        .resizable()
                        .foregroundColor(.gray)
                }
                .frame(width: 32, height: 32)
                .clipShape(Circle())
            }

            VStack(alignment: isCurrentUser ? .trailing : .leading, spacing: 4) {
                // User name for other users
                if !isCurrentUser {
                    Text(message.user.displayName)
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.secondary)
                }

                // Message content
                Text(message.content)
                    .padding(12)
                    .background(isCurrentUser ? Color.twitterBlue : Color(.systemGray5))
                    .foregroundColor(isCurrentUser ? .white : .primary)
                    .cornerRadius(16)

                // Timestamp
                Text(message.formattedTime)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            // User icon for current user
            if isCurrentUser {
                CachedAsyncImage(url: URL(string: message.user.profileImage ?? "")) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    Image(systemName: "person.circle.fill")
                        .resizable()
                        .foregroundColor(.gray)
                }
                .frame(width: 32, height: 32)
                .clipShape(Circle())
            }

            if !isCurrentUser {
                Spacer()
            }
        }
    }
}

#Preview {
    ChatView(eventId: "test", eventTitle: "Test Event")
        .environmentObject(AuthViewModel())
}
