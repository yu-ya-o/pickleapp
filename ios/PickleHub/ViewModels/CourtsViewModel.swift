import Foundation
import SwiftUI

@MainActor
class CourtsViewModel: ObservableObject {
    @Published var courts: [Court] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var selectedRegion: String = "全国"
    @Published var searchText: String = ""

    private let apiClient = APIClient.shared

    // MARK: - Fetch Courts

    func fetchCourts() async {
        isLoading = true
        errorMessage = nil

        do {
            let region = selectedRegion == "全国" ? nil : selectedRegion
            let search = searchText.isEmpty ? nil : searchText

            courts = try await apiClient.getCourts(
                region: region,
                search: search,
                indoorOutdoor: nil
            )

            print("✅ Fetched \(courts.count) courts")
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            print("❌ Fetch courts error: \(error)")
        }
    }

    func refreshCourts() async {
        await fetchCourts()
    }
}
