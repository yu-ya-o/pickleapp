import Foundation
import SwiftUI

@MainActor
class CourtDetailViewModel: ObservableObject {
    @Published var court: Court?
    @Published var events: [Event] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let apiClient = APIClient.shared
    private let courtId: String

    init(courtId: String) {
        self.courtId = courtId
    }

    // MARK: - Fetch Court Details

    func fetchCourtDetails() async {
        isLoading = true
        errorMessage = nil

        do {
            async let courtData = apiClient.getCourt(id: courtId)
            async let eventsData = apiClient.getCourtEvents(courtId: courtId)

            court = try await courtData
            events = try await eventsData

            print("✅ Fetched court details and \(events.count) events")
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("❌ Fetch court details error: \(error)")
        }
    }

    func refresh() async {
        await fetchCourtDetails()
    }
}
