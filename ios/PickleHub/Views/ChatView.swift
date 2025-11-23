import SwiftUI

struct ChatView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel: ChatViewModel
    @EnvironmentObject var authViewModel: AuthViewModel

    @State private var messageText = ""
    @State private var scrollProxy: ScrollViewProxy?

    let eventId: String
    let eventTitle: String

    init(eventId: String, eventTitle: String) {
        self.eventId = eventId
        self.eventTitle = eventTitle
        _viewModel = StateObject(wrappedValue: ChatViewModel(eventId: eventId))
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Connection status
                if !viewModel.isConnected {
                    HStack {
                        Image(systemName: "wifi.slash")
                        Text("Connecting...")
                    }
                    .font(.caption)
                    .foregroundColor(.white)
                    .padding(.vertical, 8)
                    .frame(maxWidth: .infinity)
                    .background(Color.orange)
                }

                // Messages
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(viewModel.messages) { message in
                                MessageBubbleView(
                                    message: message,
                                    isCurrentUser: message.user.id == authViewModel.currentUser?.id
                                )
                                .id(message.id)
                            }
                        }
                        .padding()
                    }
                    .onAppear {
                        scrollProxy = proxy
                    }
                    .onChange(of: viewModel.messages.count) { _, _ in
                        scrollToBottom()
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
            .navigationTitle(eventTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .task {
                await viewModel.loadChat()
            }
        }
    }

    private func sendMessage() {
        let text = messageText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        viewModel.sendMessage(content: text)
        messageText = ""
    }

    private func scrollToBottom() {
        guard let lastMessage = viewModel.messages.last else { return }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            withAnimation {
                scrollProxy?.scrollTo(lastMessage.id, anchor: .bottom)
            }
        }
    }
}

struct MessageBubbleView: View {
    let message: Message
    let isCurrentUser: Bool

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if isCurrentUser {
                Spacer()
            }

            // User icon for other users
            if !isCurrentUser {
                AsyncImage(url: URL(string: message.user.profileImage ?? "")) { image in
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
                AsyncImage(url: URL(string: message.user.profileImage ?? "")) { image in
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
