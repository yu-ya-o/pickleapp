import Foundation
import SwiftUI

@MainActor
class RankingsViewModel: ObservableObject {
    @Published var rankings: [TeamRanking] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var selectedType: RankingType = .members

    private let apiClient = APIClient.shared

    enum RankingType: String, CaseIterable {
        case members = "members"
        case events = "events"

        var displayName: String {
            switch self {
            case .members:
                return "メンバー数"
            case .events:
                return "公開イベント数"
            }
        }
    }

    // MARK: - Fetch Rankings

    func fetchRankings() async {
        isLoading = true
        errorMessage = nil

        do {
            rankings = try await apiClient.getTeamRankings(type: selectedType.rawValue)
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("❌ Fetch rankings error: \(error)")
        }
    }

    func refresh() async {
        await fetchRankings()
    }

    func changeRankingType(_ type: RankingType) {
        selectedType = type
        Task {
            await fetchRankings()
        }
    }
}
