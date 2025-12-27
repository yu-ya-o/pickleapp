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
        print("🔵 initialLoad called, hasLoadedInitially: \(hasLoadedInitially)")
        guard !hasLoadedInitially else {
            print("⚠️ Already loaded, skipping")
            return
        }
        hasLoadedInitially = true
        await fetchRankings()
    }

    func fetchRankings() async {
        // 既にロード中の場合は新しいリクエストを開始しない
        print("🟢 fetchRankings called, isLoading: \(isLoading)")
        guard !isLoading else {
            print("⚠️ Already loading, skipping")
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            print("📡 Starting API request...")
            rankings = try await apiClient.getTeamRankings(type: selectedType.rawValue)
            print("✅ API request succeeded, got \(rankings.count) rankings")
            isLoading = false
        } catch {
            print("❌ API request failed: \(error)")
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
