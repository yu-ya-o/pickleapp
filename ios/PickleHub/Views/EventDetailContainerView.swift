import SwiftUI

/// Container view that fetches an event by ID and displays EventDetailView
struct EventDetailContainerView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var eventsViewModel = EventsViewModel()
    @State private var event: Event?
    @State private var isLoading = true
    @State private var errorMessage: String?

    let eventId: String

    var body: some View {
        NavigationView {
            Group {
                if isLoading {
                    ProgressView("イベントを読み込み中...")
                } else if let error = errorMessage {
                    VStack(spacing: Spacing.md) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 50))
                            .foregroundColor(.orange)
                        Text("エラー")
                            .font(.headlineMedium)
                        Text(error)
                            .font(.bodyMedium)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                } else if let event = event {
                    EventDetailView(event: event)
                        .environmentObject(eventsViewModel)
                        .environmentObject(authViewModel)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .task {
                await loadEvent()
            }
        }
    }

    private func loadEvent() async {
        isLoading = true
        errorMessage = nil

        do {
            let fetchedEvent = try await APIClient.shared.getEvent(id: eventId)
            self.event = fetchedEvent
        } catch {
            errorMessage = "イベントの読み込みに失敗しました"
        }

        isLoading = false
    }
}
