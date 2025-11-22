import SwiftUI

struct EventsListView: View {
    @EnvironmentObject var eventsViewModel: EventsViewModel
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showingCreateEvent = false
    @State private var selectedSegment = 0  // 0: 通常イベント, 1: チームイベント
    @State private var searchText = ""
    @State private var selectedRegion = ""

    var filteredEvents: [Event] {
        var events = eventsViewModel.events
        print("🔍 Total events: \(events.count), Selected region: '\(selectedRegion)', Search: '\(searchText)'")

        // フリーテキスト検索
        if !searchText.isEmpty {
            events = events.filter { event in
                event.title.localizedCaseInsensitiveContains(searchText) ||
                event.description.localizedCaseInsensitiveContains(searchText) ||
                event.location.localizedCaseInsensitiveContains(searchText)
            }
            print("📝 After search filter: \(events.count) events")
        }

        // 地域フィルター
        if !selectedRegion.isEmpty && selectedRegion != "すべて" {
            events = events.filter { $0.location.contains(selectedRegion) }
            print("📍 After region filter: \(events.count) events")
        }

        print("✅ Final filtered events: \(events.count)")
        return events
    }

    var filteredTeamEvents: [TeamEvent] {
        var events = eventsViewModel.teamEvents
        print("🔍 Total team events: \(events.count), Selected region: '\(selectedRegion)', Search: '\(searchText)'")

        // フリーテキスト検索
        if !searchText.isEmpty {
            events = events.filter { event in
                event.title.localizedCaseInsensitiveContains(searchText) ||
                event.description.localizedCaseInsensitiveContains(searchText) ||
                event.location.localizedCaseInsensitiveContains(searchText)
            }
            print("📝 After search filter: \(events.count) team events")
        }

        // 地域フィルター
        if !selectedRegion.isEmpty && selectedRegion != "すべて" {
            events = events.filter { $0.location.contains(selectedRegion) }
            print("📍 After region filter: \(events.count) team events")
        }

        print("✅ Final filtered team events: \(events.count)")
        return events
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // 検索バー
                VStack(spacing: Spacing.sm) {
                    // フリーテキスト検索
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.gray)
                        TextField("イベントを検索", text: $searchText)
                            .font(.bodyMedium)
                        if !searchText.isEmpty {
                            Button(action: { searchText = "" }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                    .padding(Spacing.sm)
                    .background(Color(.systemGray6))
                    .cornerRadius(CornerRadius.medium)

                    // 地域フィルター
                    HStack {
                        Image(systemName: "mappin.circle")
                            .foregroundColor(.gray)
                        Picker("地域を選択", selection: $selectedRegion) {
                            Text("すべて").tag("すべて")
                            ForEach(Prefectures.all, id: \.self) { prefecture in
                                Text(prefecture).tag(prefecture)
                            }
                        }
                        .pickerStyle(.menu)
                        .font(.bodyMedium)
                    }
                    .padding(Spacing.sm)
                    .background(Color(.systemGray6))
                    .cornerRadius(CornerRadius.medium)
                }
                .padding(Spacing.md)
                .background(Color.white)

                // セグメントコントロール
                Picker("イベントタイプ", selection: $selectedSegment) {
                    Text("通常イベント").tag(0)
                    Text("チームイベント").tag(1)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding(.horizontal, Spacing.md)
                .padding(.bottom, Spacing.sm)

                // イベント一覧
                ZStack {
                    if eventsViewModel.isLoading {
                        ProgressView()
                    } else if selectedSegment == 0 {
                        // 通常イベント
                        if filteredEvents.isEmpty {
                            VStack(spacing: Spacing.lg) {
                                Image(systemName: "calendar.badge.exclamationmark")
                                    .font(.system(size: 60))
                                    .foregroundColor(.gray)
                                Text("イベントが見つかりません")
                                    .font(.headlineMedium)
                                    .foregroundColor(.secondary)
                                Text("最初のイベントを作成しましょう！")
                                    .font(.bodyMedium)
                                    .foregroundColor(.secondary)
                            }
                        } else {
                            List {
                                ForEach(filteredEvents) { event in
                                    NavigationLink(destination: EventDetailView(event: event)) {
                                        ModernEventRowView(event: event)
                                    }
                                    .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                                    .listRowSeparator(.hidden)
                                }
                            }
                            .listStyle(.plain)
                            .refreshable {
                                await eventsViewModel.refreshEvents()
                            }
                        }
                    } else {
                        // チームイベント
                        if filteredTeamEvents.isEmpty {
                            VStack(spacing: Spacing.lg) {
                                Image(systemName: "person.3")
                                    .font(.system(size: 60))
                                    .foregroundColor(.gray)
                                Text("チームイベントが見つかりません")
                                    .font(.headlineMedium)
                                    .foregroundColor(.secondary)
                                Text("チームに参加してイベントを確認しましょう")
                                    .font(.bodyMedium)
                                    .foregroundColor(.secondary)
                            }
                        } else {
                            List {
                                ForEach(filteredTeamEvents) { event in
                                    NavigationLink(destination: TeamEventDetailView(teamId: event.team.id, eventId: event.id)) {
                                        TeamEventRowView(event: event)
                                    }
                                    .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                                    .listRowSeparator(.hidden)
                                }
                            }
                            .listStyle(.plain)
                            .refreshable {
                                await eventsViewModel.refreshTeamEvents()
                            }
                        }
                    }
                }
            }
            .navigationTitle("イベント")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingCreateEvent = true
                    }) {
                        Image(systemName: "plus.circle.fill")
                            .foregroundColor(.twitterBlue)
                            .font(.title2)
                    }
                }
            }
            .sheet(isPresented: $showingCreateEvent) {
                CreateEventView()
                    .environmentObject(eventsViewModel)
            }
            .task {
                // デフォルトで「すべて」を選択
                if selectedRegion.isEmpty {
                    selectedRegion = "すべて"
                }
                await eventsViewModel.fetchEvents()
                await eventsViewModel.fetchTeamEvents()
            }
            .onChange(of: selectedSegment) { newValue in
                // セグメントが変更されたら対応するイベントを取得
                Task {
                    if newValue == 0 {
                        await eventsViewModel.fetchEvents()
                    } else {
                        await eventsViewModel.fetchTeamEvents()
                    }
                }
            }
            .onChange(of: authViewModel.currentUser?.id) { _ in
                // ユーザーが変更されたらフィルターをリセット
                selectedRegion = "すべて"
                searchText = ""
                Task {
                    await eventsViewModel.fetchEvents()
                    await eventsViewModel.fetchTeamEvents()
                }
            }
        }
    }
}

struct EventRowView: View {
    let event: Event

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(event.title)
                    .font(.headline)
                Spacer()
                Text(event.skillLevelEmoji)
            }

            Text(event.formattedDate)
                .font(.subheadline)
                .foregroundColor(.secondary)

            HStack {
                Label(event.location, systemImage: "mappin.circle")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                Label("\(event.availableSpots)/\(event.maxParticipants) spots", systemImage: "person.2")
                    .font(.caption)
                    .foregroundColor(event.availableSpots > 0 ? .green : .red)
            }

            if event.isUserReserved == true {
                Text("✓ Reserved")
                    .font(.caption)
                    .foregroundColor(.green)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.green.opacity(0.1))
                    .cornerRadius(4)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    EventsListView()
        .environmentObject(EventsViewModel())
}
