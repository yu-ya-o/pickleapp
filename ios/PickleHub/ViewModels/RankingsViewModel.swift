import Foundation
import SwiftUI

@MainActor
class RankingsViewModel: ObservableObject {
    @Published var rankings: [TeamRanking] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var selectedType: RankingType = .members

    private let apiClient = APIClient.shared
    private var hasLoadedInitially = false

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

    func initialLoad() async {
        // 初回ロードのみ実行
        guard !hasLoadedInitially else { return }
        hasLoadedInitially = true
        await fetchRankings()
    }

    func fetchRankings() async {
        // 既にロード中の場合は新しいリクエストを開始しない
        guard !isLoading else { return }

        isLoading = true
        errorMessage = nil

        do {
            let newRankings = try await apiClient.getTeamRankings(type: selectedType.rawValue)
            rankings = newRankings
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("❌ Fetch rankings error: \(error)")
        }
    }

    func refresh() async {
        // 既にロード中の場合は何もしない
        guard !isLoading else { return }
        await fetchRankings()
    }

    func changeRankingType(_ type: RankingType) {
        selectedType = type
        Task {
            await fetchRankings()
        }
    }
}
