import Foundation
import SwiftUI

@MainActor
class ChatViewModel: ObservableObject {
    @Published var messages: [Message] = []
    @Published var isLoading = false
    @Published var isConnected = false
    @Published var errorMessage: String?

    private let apiClient = APIClient.shared
    private let webSocketClient = WebSocketClient()

    var eventId: String
    var chatRoomId: String?

    init(eventId: String) {
        self.eventId = eventId
        webSocketClient.delegate = self
    }

    // MARK: - Load Chat

    func loadChat() async {
        isLoading = true
        errorMessage = nil

        do {
            let chatRoom = try await apiClient.getChatRoom(eventId: eventId)
            chatRoomId = chatRoom.id
            messages = chatRoom.messages

            // Connect to WebSocket
            if let chatRoomId = chatRoomId,
               let token = UserDefaults.standard.string(forKey: "authToken") {
                connectWebSocket(chatRoomId: chatRoomId, token: token)
            }

            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("Load chat error: \(error)")
        }
    }

    // MARK: - WebSocket

    func connectWebSocket(chatRoomId: String, token: String) {
        webSocketClient.connect(chatRoomId: chatRoomId, token: token)
    }

    func disconnectWebSocket() {
        webSocketClient.disconnect()
    }

    // MARK: - Send Message

    func sendMessage(content: String) {
        guard !content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return
        }

        // Send via WebSocket for real-time delivery
        webSocketClient.sendChatMessage(content)
    }

    deinit {
        disconnectWebSocket()
    }
}

// MARK: - WebSocketClientDelegate

extension ChatViewModel: WebSocketClientDelegate {
    func webSocketDidConnect() {
        isConnected = true
        print("Chat WebSocket connected")
    }

    func webSocketDidDisconnect() {
        isConnected = false
        print("Chat WebSocket disconnected")
    }

    func webSocketDidReceiveMessage(_ message: Message) {
        // Add message to list if not already present
        if !messages.contains(where: { $0.id == message.id }) {
            messages.append(message)
        }
    }

    func webSocketUserJoined(_ user: MessageUser) {
        print("User joined: \(user.name)")
    }

    func webSocketUserLeft(_ user: MessageUser) {
        print("User left: \(user.name)")
    }

    func webSocketDidReceiveError(_ error: String) {
        errorMessage = error
        print("WebSocket error: \(error)")
    }
}
