import SwiftUI

struct TeamEventsListView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel: TeamEventsViewModel
    @State private var showingCreateEvent = false

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
                        Text("No Team Events")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text("Team events will appear here")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                } else {
                    List {
                        ForEach(viewModel.events) { event in
                            NavigationLink(destination: TeamEventDetailView(
                                teamId: viewModel.teamId,
                                eventId: event.id
                            )) {
                                TeamEventRowView(event: event)
                            }
                            .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                            .listRowSeparator(.hidden)
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Team Events")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") {
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
            .task {
                await viewModel.loadTeam()
                await viewModel.loadEvents()
            }
        }
    }
}

struct TeamEventRowView: View {
    let event: TeamEvent

    var body: some View {
        HStack(alignment: .top, spacing: Spacing.md) {
            // Left: Creator profile image and nickname
            VStack(spacing: Spacing.xs) {
                if let profileImageURL = event.creator.profileImageURL {
                    AsyncImage(url: profileImageURL) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFill()
                                .frame(width: 50, height: 50)
                                .clipShape(Circle())
                        case .failure(_), .empty:
                            Image(systemName: "person.circle.fill")
                                .resizable()
                                .frame(width: 50, height: 50)
                                .foregroundColor(.gray)
                        @unknown default:
                            EmptyView()
                        }
                    }
                } else {
                    Image(systemName: "person.circle.fill")
                        .resizable()
                        .frame(width: 50, height: 50)
                        .foregroundColor(.gray)
                }

                Text(event.creator.displayName)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                    .frame(width: 50)
            }

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

                    // Participating badge
                    if event.isUserParticipating == true {
                        HStack(spacing: 2) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.caption)
                            Text("参加中")
                                .font(.labelSmall)
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, Spacing.sm)
                        .padding(.vertical, 2)
                        .background(Capsule().fill(Color.green))
                    } else if !event.hasCapacity {
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
        .padding(Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.medium)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
        )
    }
}

#Preview {
    TeamEventsListView(teamId: "test")
}
