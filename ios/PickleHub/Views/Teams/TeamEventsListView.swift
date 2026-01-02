import SwiftUI

struct TeamEventsListView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel: TeamEventsViewModel
    @State private var showingCreateEvent = false
    @State private var selectedUser: User?
    @State private var showingUserProfile = false
    @State private var showingTeamDetail = false

    init(teamId: String) {
        _viewModel = StateObject(wrappedValue: TeamEventsViewModel(teamId: teamId))
    }

    var body: some View {
        NavigationView {
            ZStack {
                if viewModel.isLoading && viewModel.events.isEmpty {
                    ProgressView()
                } else if viewModel.events.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "calendar.badge.exclamationmark")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        Text("チームイベントがありません")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text("チームイベントがここに表示されます")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                } else {
                    List {
                        ForEach(viewModel.events) { event in
                            NavigationLink(destination: TeamEventDetailView(
                                teamId: viewModel.teamId,
                                eventId: event.id
                            )
                            .environmentObject(viewModel)
                            ) {
                                TeamEventRowView(event: event, onProfileTap: {
                                    selectedUser = event.creator.toUser()
                                    showingUserProfile = true
                                }, onTeamTap: {
                                    showingTeamDetail = true
                                })
                            }
                            .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                            .listRowSeparator(.hidden)
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("チームイベント")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("完了") {
                        dismiss()
                    }
                }

                if viewModel.canCreateEvents {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button(action: {
                            showingCreateEvent = true
                        }) {
                            Image(systemName: "plus")
                        }
                    }
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
            .sheet(isPresented: $showingCreateEvent) {
                CreateTeamEventView(teamId: viewModel.teamId)
                    .environmentObject(viewModel)
            }
            .sheet(isPresented: $showingUserProfile) {
                if let user = selectedUser {
                    UserProfileView(user: user)
                }
            }
            .sheet(isPresented: $showingTeamDetail) {
                if let team = viewModel.team {
                    NavigationView {
                        TeamDetailView(teamId: team.id, isSheet: true)
                    }
                }
            }
            .background(
                NavigationLink(
                    destination: viewModel.navigateToTeamEvent.map { event in
                        TeamEventDetailView(teamId: viewModel.teamId, eventId: event.id)
                            .environmentObject(viewModel)
                    },
                    isActive: Binding(
                        get: { viewModel.navigateToTeamEvent != nil },
                        set: { if !$0 { viewModel.navigateToTeamEvent = nil } }
                    )
                ) { EmptyView() }
            )
            .onChange(of: viewModel.navigateToTeamEvent) { newValue in
                print("🔍 navigateToTeamEvent changed in TeamEventsListView")
                print("   New: \(newValue?.id ?? "nil")")
            }
            .task {
                await viewModel.loadTeam()
                await viewModel.loadEvents()
            }
        }
    }
}

struct TeamEventRowView: View {
    let event: TeamEvent
    var onProfileTap: (() -> Void)? = nil
    var onTeamTap: (() -> Void)? = nil

    var body: some View {
        HStack(alignment: .top, spacing: Spacing.md) {
            // Left: Team icon and name (tappable)
            Button(action: {
                onTeamTap?()
            }) {
                VStack(spacing: Spacing.xs) {
                    TeamIconView(url: event.team.iconImageURL, size: 50)

                    Text(event.team.name)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                        .frame(width: 50)
                }
            }
            .buttonStyle(PlainButtonStyle())

            // Right: Date, Title, Location
            VStack(alignment: .leading, spacing: Spacing.xs) {
                // Date
                HStack(spacing: Spacing.xs) {
                    Image(systemName: "calendar")
                        .font(.caption)
                        .foregroundColor(.twitterBlue)
                    Text(event.formattedDate)
                        .font(.bodySmall)
                        .foregroundColor(.secondary)
                }

                // Title
                Text(event.title)
                    .font(.headlineMedium)
                    .foregroundColor(.primary)
                    .lineLimit(2)

                // Location
                HStack(spacing: Spacing.xs) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.caption)
                        .foregroundColor(.twitterBlue)
                    Text(event.location)
                        .font(.bodySmall)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }

                // Participants and status
                HStack(spacing: Spacing.xs) {
                    Image(systemName: "person.2.fill")
                        .font(.caption)
                        .foregroundColor(.twitterBlue)
                    Text(event.capacityText)
                        .font(.bodySmall)
                        .foregroundColor(.secondary)

                    Spacer()

                    // Status badge (満席のみ表示)
                    if !event.hasCapacity {
                        Text("満席")
                            .font(.labelSmall)
                            .foregroundColor(.white)
                            .padding(.horizontal, Spacing.sm)
                            .padding(.vertical, 2)
                            .background(Capsule().fill(Color.red))
                    }
                }
            }
        }
        .padding(.horizontal, Spacing.md)
        .padding(.vertical, Spacing.sm)
        .background(Color.white)
    }
}

#Preview {
    TeamEventsListView(teamId: "test")
}
