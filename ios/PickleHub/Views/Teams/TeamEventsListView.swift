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
                        }
                    }
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
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(event.title)
                    .font(.headline)
                Spacer()
                if event.isUserParticipating == true {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                }
            }

            Text(event.formattedDate)
                .font(.subheadline)
                .foregroundColor(.secondary)

            HStack {
                Label(event.location, systemImage: "mappin.circle")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                Label(event.capacityText, systemImage: "person.2")
                    .font(.caption)
                    .foregroundColor(event.hasCapacity ? .green : .red)
            }

            if event.isUserParticipating == true {
                Text("✓ Participating")
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
    TeamEventsListView(teamId: "test")
}
