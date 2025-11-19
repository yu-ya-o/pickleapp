import SwiftUI

struct EventsListView: View {
    @EnvironmentObject var eventsViewModel: EventsViewModel
    @State private var showingCreateEvent = false

    var body: some View {
        NavigationView {
            ZStack {
                if eventsViewModel.isLoading && eventsViewModel.events.isEmpty {
                    ProgressView()
                } else if eventsViewModel.events.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "calendar.badge.exclamationmark")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        Text("No events found")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text("Create your first event!")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                } else {
                    List {
                        ForEach(eventsViewModel.events) { event in
                            NavigationLink(destination: EventDetailView(event: event)) {
                                EventRowView(event: event)
                            }
                        }
                    }
                    .refreshable {
                        await eventsViewModel.refreshEvents()
                    }
                }
            }
            .navigationTitle("Events")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingCreateEvent = true
                    }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingCreateEvent) {
                CreateEventView()
                    .environmentObject(eventsViewModel)
            }
            .task {
                await eventsViewModel.fetchEvents()
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
