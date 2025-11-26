import SwiftUI

struct MyEventsView: View {
    @EnvironmentObject var eventsViewModel: EventsViewModel
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var selectedUser: User?
    @State private var showingUserProfile = false
    @State private var selectedTab: EventTimeFilter = .upcoming

    enum EventTimeFilter {
        case upcoming
        case past
    }

    var myCreatedEvents: [Event] {
        eventsViewModel.events.filter { $0.creator.id == authViewModel.currentUser?.id }
    }

    var myReservedEvents: [Event] {
        eventsViewModel.events.filter { event in
            event.isUserReserved == true && event.creator.id != authViewModel.currentUser?.id
        }
    }

    var myTeamEvents: [TeamEvent] {
        eventsViewModel.teamEvents
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Tab Picker
                Picker("Time Filter", selection: $selectedTab) {
                    Text("これから").tag(EventTimeFilter.upcoming)
                    Text("過去").tag(EventTimeFilter.past)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .padding(.vertical, 8)
                .onChange(of: selectedTab) { _, newValue in
                    Task {
                        let upcoming = (newValue == .upcoming)
                        await eventsViewModel.fetchEvents(upcoming: upcoming)
                        await eventsViewModel.fetchTeamEvents(upcoming: upcoming)
                    }
                }

                if myCreatedEvents.isEmpty && myReservedEvents.isEmpty && myTeamEvents.isEmpty {
                    VStack(spacing: Spacing.lg) {
                        Image(systemName: "star.slash")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        Text("イベントがありません")
                            .font(.headlineMedium)
                            .foregroundColor(.secondary)
                        Text("イベントを作成または参加して始めましょう！")
                            .font(.bodyMedium)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding()
                } else {
                    List {
                        if !myCreatedEvents.isEmpty {
                            Section(header: Text("作成したイベント")) {
                                ForEach(myCreatedEvents) { event in
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
                            }
                        }

                        if !myReservedEvents.isEmpty {
                            Section(header: Text("参加したイベント")) {
                                ForEach(myReservedEvents) { event in
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
                            }
                        }

                        if !myTeamEvents.isEmpty {
                            Section(header: Text("参加したチームイベント")) {
                                ForEach(myTeamEvents) { event in
                                    ZStack {
                                        NavigationLink(destination: TeamEventDetailContainerView(teamId: event.teamId, eventId: event.id)) {
                                            EmptyView()
                                        }
                                        .opacity(0)

                                        TeamEventRowView(event: event)
                                    }
                                    .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
                                    .listRowSeparator(.visible)
                                }
                            }
                        }
                    }
                    .listStyle(.plain)
                    .refreshable {
                        let upcoming = (selectedTab == .upcoming)
                        await eventsViewModel.fetchEvents(upcoming: upcoming)
                        await eventsViewModel.fetchTeamEvents(upcoming: upcoming)
                    }
                }
            }
            .navigationTitle("マイイベント")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showingUserProfile) {
                if let user = selectedUser {
                    UserProfileView(user: user)
                }
            }
            .task {
                let upcoming = (selectedTab == .upcoming)
                await eventsViewModel.fetchEvents(upcoming: upcoming)
                await eventsViewModel.fetchTeamEvents(upcoming: upcoming)
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

#Preview {
    MyEventsView()
        .environmentObject(EventsViewModel())
        .environmentObject(AuthViewModel())
}
