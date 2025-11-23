import SwiftUI

struct EventsListView: View {
    @EnvironmentObject var eventsViewModel: EventsViewModel
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showingCreateEvent = false
    @State private var selectedSegment = 0  // 0: 通常イベント, 1: チームイベント
    @State private var searchText = ""
    @State private var selectedRegion = ""
    @State private var selectedUser: User?
    @State private var showingUserProfile = false

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
        if !selectedRegion.isEmpty {
            events = events.filter { $0.region == selectedRegion }
            print("📍 After region filter: \(events.count) events")
        }

        print("✅ Final filtered events: \(events.count)")
        return events
    }

    var filteredPublicTeamEvents: [TeamEvent] {
        var events = eventsViewModel.publicTeamEvents
        print("🔍 Total public team events: \(events.count), Selected region: '\(selectedRegion)', Search: '\(searchText)'")

        // フリーテキスト検索
        if !searchText.isEmpty {
            events = events.filter { event in
                event.title.localizedCaseInsensitiveContains(searchText) ||
                event.description.localizedCaseInsensitiveContains(searchText) ||
                event.location.localizedCaseInsensitiveContains(searchText)
            }
            print("📝 After search filter: \(events.count) public team events")
        }

        // 地域フィルター
        if !selectedRegion.isEmpty {
            events = events.filter { $0.region == selectedRegion }
            print("📍 After region filter: \(events.count) public team events")
        }

        print("✅ Final filtered public team events: \(events.count)")
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
        if !selectedRegion.isEmpty {
            events = events.filter { $0.region == selectedRegion }
            print("📍 After region filter: \(events.count) team events")
        }

        print("✅ Final filtered team events: \(events.count)")
        return events
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // カスタムタイトル
                Text("PickleHub")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.black)

                // セグメントコントロール
                Picker("イベントタイプ", selection: $selectedSegment) {
                    Text("通常イベント").tag(0)
                    Text("チームイベント").tag(1)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding(.horizontal, Spacing.md)
                .padding(.vertical, Spacing.sm)
                .background(Color.white)

                // 検索バー
                HStack(spacing: Spacing.sm) {
                    // 都道府県フィルター（左）
                    HStack {
                        Image(systemName: "mappin.circle")
                            .foregroundColor(.gray)
                            .font(.system(size: 14))
                        Picker("地域", selection: $selectedRegion) {
                            ForEach(Prefectures.all, id: \.self) { prefecture in
                                Text(prefecture).tag(prefecture)
                            }
                        }
                        .pickerStyle(.menu)
                        .font(.bodyMedium)
                    }
                    .padding(.horizontal, Spacing.sm)
                    .padding(.vertical, Spacing.xs)
                    .background(Color(.systemGray6))
                    .cornerRadius(CornerRadius.medium)

                    // フリーテキスト検索（右）
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.gray)
                            .font(.system(size: 14))
                        TextField("イベントを検索", text: $searchText)
                            .font(.bodyMedium)
                        if !searchText.isEmpty {
                            Button(action: { searchText = "" }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.gray)
                                    .font(.system(size: 14))
                            }
                        }
                    }
                    .padding(.horizontal, Spacing.sm)
                    .padding(.vertical, Spacing.xs)
                    .background(Color(.systemGray6))
                    .cornerRadius(CornerRadius.medium)
                }
                .padding(.horizontal, Spacing.md)
                .padding(.bottom, Spacing.sm)
                .background(Color.white)

                Divider()

                // イベント一覧
                ZStack {
                    if eventsViewModel.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else if selectedSegment == 0 {
                        // 通常イベント（通常イベント + パブリックなチームイベント）
                        if filteredEvents.isEmpty && filteredPublicTeamEvents.isEmpty {
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
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                        } else {
                            List {
                                // 通常イベント
                                ForEach(filteredEvents) { event in
                                    ZStack {
                                        NavigationLink(destination: EventDetailView(event: event)) {
                                            EmptyView()
                                        }
                                        .opacity(0)

                                        ModernEventRowView(event: event, onProfileTap: {
                                            selectedUser = event.creator
                                            showingUserProfile = true
                                        })
                                    }
                                    .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
                                    .listRowSeparator(.visible)
                                }

                                // パブリックなチームイベント
                                ForEach(filteredPublicTeamEvents) { event in
                                    ZStack {
                                        NavigationLink(destination: TeamEventDetailView(teamId: event.team.id, eventId: event.id)) {
                                            EmptyView()
                                        }
                                        .opacity(0)

                                        TeamEventRowView(event: event, onProfileTap: {
                                            selectedUser = event.creator.toUser()
                                            showingUserProfile = true
                                        })
                                    }
                                    .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
                                    .listRowSeparator(.visible)
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
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                        } else {
                            List {
                                ForEach(filteredTeamEvents) { event in
                                    ZStack {
                                        NavigationLink(destination: TeamEventDetailView(teamId: event.team.id, eventId: event.id)) {
                                            EmptyView()
                                        }
                                        .opacity(0)

                                        TeamEventRowView(event: event, onProfileTap: {
                                            selectedUser = event.creator.toUser()
                                            showingUserProfile = true
                                        })
                                    }
                                    .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
                                    .listRowSeparator(.visible)
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
            .navigationBarHidden(true)
            .overlay(alignment: .bottomTrailing) {
                Button(action: {
                    showingCreateEvent = true
                }) {
                    Image(systemName: "plus")
                        .font(.title2)
                        .foregroundColor(.white)
                        .frame(width: 56, height: 56)
                        .background(Color.twitterBlue)
                        .clipShape(Circle())
                        .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
                }
                .padding(.trailing, 16)
                .padding(.bottom, 16)
            }
            .sheet(isPresented: $showingCreateEvent) {
                CreateEventView()
                    .environmentObject(eventsViewModel)
            }
            .sheet(isPresented: $showingUserProfile) {
                if let user = selectedUser {
                    UserProfileView(user: user)
                }
            }
            .task {
                // デフォルトでユーザの地域を選択
                if selectedRegion.isEmpty {
                    selectedRegion = authViewModel.currentUser?.region ?? Prefectures.all.first ?? ""
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
                // ユーザーが変更されたらフィルターをユーザの地域にリセット
                selectedRegion = authViewModel.currentUser?.region ?? Prefectures.all.first ?? ""
                searchText = ""
                Task {
                    await eventsViewModel.fetchEvents()
                    await eventsViewModel.fetchTeamEvents()
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct EventRowView: View {
    let event: Event

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(event.title)
                .font(.headline)

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
                    .foregroundColor(event.availableSpots > 0 ? .secondary : .red)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    EventsListView()
        .environmentObject(EventsViewModel())
}
