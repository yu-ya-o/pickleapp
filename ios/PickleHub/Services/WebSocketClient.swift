import Foundation

protocol WebSocketClientDelegate: AnyObject {
    func webSocketDidConnect()
    func webSocketDidDisconnect()
    func webSocketDidReceiveMessage(_ message: Message)
    func webSocketUserJoined(_ user: MessageUser)
    func webSocketUserLeft(_ user: MessageUser)
    func webSocketDidReceiveError(_ error: String)
}

class WebSocketClient: NSObject {
    private var webSocketTask: URLSessionWebSocketTask?
    private var urlSession: URLSession?
    private var chatRoomId: String?
    private var token: String?

    weak var delegate: WebSocketClientDelegate?

    override init() {
        super.init()
        urlSession = URLSession(configuration: .default, delegate: self, delegateQueue: OperationQueue())
    }

    // MARK: - Connection

    func connect(chatRoomId: String, token: String) {
        guard let url = URL(string: Config.websocketURL) else {
            delegate?.webSocketDidReceiveError("Invalid WebSocket URL")
            return
        }

        self.chatRoomId = chatRoomId
        self.token = token

        webSocketTask = urlSession?.webSocketTask(with: url)
        webSocketTask?.resume()

        receiveMessage()

        // Send join message after connection
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            self?.joinRoom()
        }
    }

    func disconnect() {
        leaveRoom()
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        webSocketTask = nil
        chatRoomId = nil
        token = nil
    }

    // MARK: - Send Messages

    private func sendMessage(_ message: Encodable) {
        guard let data = try? JSONEncoder().encode(message),
              let string = String(data: data, encoding: .utf8) else {
            return
        }

        let message = URLSessionWebSocketTask.Message.string(string)
        webSocketTask?.send(message) { [weak self] error in
            if let error = error {
                print("WebSocket send error: \(error)")
                self?.delegate?.webSocketDidReceiveError(error.localizedDescription)
            }
        }
    }

    private func joinRoom() {
        guard let chatRoomId = chatRoomId, let token = token else { return }
        let message = WSJoinMessage(chatRoomId: chatRoomId, token: token)
        sendMessage(message)
    }

    private func leaveRoom() {
        let message = WSLeaveMessage()
        sendMessage(message)
    }

    func sendChatMessage(_ content: String) {
        let message = WSChatMessage(content: content)
        sendMessage(message)
    }

    // MARK: - Receive Messages

    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .success(let message):
                self?.handleMessage(message)
                self?.receiveMessage() // Continue receiving
            case .failure(let error):
                print("WebSocket receive error: \(error)")
                self?.delegate?.webSocketDidReceiveError(error.localizedDescription)
            }
        }
    }

    private func handleMessage(_ message: URLSessionWebSocketTask.Message) {
        switch message {
        case .string(let text):
            handleTextMessage(text)
        case .data(let data):
            if let text = String(data: data, encoding: .utf8) {
                handleTextMessage(text)
            }
        @unknown default:
            break
        }
    }

    private func handleTextMessage(_ text: String) {
        guard let data = text.data(using: .utf8) else { return }

        do {
            let wsMessage = try JSONDecoder().decode(WSMessage.self, from: data)

            DispatchQueue.main.async { [weak self] in
                switch wsMessage.type {
                case "joined":
                    self?.delegate?.webSocketDidConnect()

                case "message":
                    if let messageData = wsMessage.data?.message {
                        self?.delegate?.webSocketDidReceiveMessage(messageData)
                    }

                case "user_joined":
                    if let user = wsMessage.data?.user {
                        self?.delegate?.webSocketUserJoined(user)
                    }

                case "user_left":
                    if let user = wsMessage.data?.user {
                        self?.delegate?.webSocketUserLeft(user)
                    }

                case "error":
                    if let error = wsMessage.error {
                        self?.delegate?.webSocketDidReceiveError(error)
                    }

                default:
                    break
                }
            }
        } catch {
            print("Failed to decode WebSocket message: \(error)")
        }
    }
}

// MARK: - URLSessionWebSocketDelegate

extension WebSocketClient: URLSessionWebSocketDelegate {
    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didOpenWithProtocol protocol: String?) {
        print("WebSocket connected")
    }

    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didCloseWith closeCode: URLSessionWebSocketTask.CloseCode, reason: Data?) {
        print("WebSocket disconnected")
        DispatchQueue.main.async { [weak self] in
            self?.delegate?.webSocketDidDisconnect()
        }
    }
}
