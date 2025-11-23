import SwiftUI

struct TeamChatView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel

    @State private var messages: [TeamMessage] = []
    @State private var messageText = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingEventPicker = false
    @State private var teamEvents: [TeamEvent] = []

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
                    // Event share button
                    Button(action: {
                        showingEventPicker = true
                    }) {
                        Image(systemName: "calendar.badge.plus")
                            .foregroundColor(.twitterBlue)
                            .padding(10)
                            .background(Color(.systemGray6))
                            .clipShape(Circle())
                    }

                    TextField("メッセージを入力...", text: $messageText, axis: .vertical)
                        .textFieldStyle(.roundedBorder)
                        .lineLimit(1...4)

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
                await loadTeamEvents()
            }
            .sheet(isPresented: $showingEventPicker) {
                EventPickerView(
                    events: teamEvents,
                    onSelectEvent: { event in
                        shareEvent(event)
                        showingEventPicker = false
                    }
                )
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

    private func loadTeamEvents() async {
        do {
            teamEvents = try await APIClient.shared.getTeamEvents(teamId: teamId)
        } catch {
            print("Load team events error: \(error)")
        }
    }

    private func shareEvent(_ event: TeamEvent) {
        let eventInfo = """
📅 イベント共有
【\(event.title)】
📍 \(event.location)
🕐 \(event.formattedDate)
👥 \(event.participantCount)/\(event.maxParticipants ?? 0)人

イベントID: \(event.id)
"""
        Task {
            do {
                let newMessage = try await APIClient.shared.sendTeamMessage(teamId: teamId, content: eventInfo)
                messages.append(newMessage)
            } catch {
                errorMessage = error.localizedDescription
                print("Send event share message error: \(error)")
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

struct EventPickerView: View {
    @Environment(\.dismiss) var dismiss
    let events: [TeamEvent]
    let onSelectEvent: (TeamEvent) -> Void

    var body: some View {
        NavigationView {
            List {
                if events.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "calendar.badge.exclamationmark")
                            .font(.system(size: 50))
                            .foregroundColor(.gray)
                        Text("共有できるイベントがありません")
                            .font(.headline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                } else {
                    ForEach(events) { event in
                        Button(action: {
                            onSelectEvent(event)
                        }) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(event.title)
                                    .font(.headline)
                                    .foregroundColor(.primary)

                                HStack {
                                    Image(systemName: "calendar")
                                    Text(event.formattedDate)
                                }
                                .font(.caption)
                                .foregroundColor(.secondary)

                                HStack {
                                    Image(systemName: "mappin.circle")
                                    Text(event.location)
                                }
                                .font(.caption)
                                .foregroundColor(.secondary)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
            }
            .navigationTitle("イベントを選択")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("キャンセル") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct TeamMessageBubbleView: View {
    let message: TeamMessage
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

#Preview {
    TeamChatView(teamId: "test", teamName: "Test Team")
        .environmentObject(AuthViewModel())
}
