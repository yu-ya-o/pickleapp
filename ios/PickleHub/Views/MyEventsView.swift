import SwiftUI

struct MyEventsView: View {
    @EnvironmentObject var eventsViewModel: EventsViewModel
    @EnvironmentObject var authViewModel: AuthViewModel

    var myCreatedEvents: [Event] {
        eventsViewModel.events.filter { $0.creator.id == authViewModel.currentUser?.id }
    }

    var myReservedEvents: [Event] {
        eventsViewModel.events.filter { event in
            event.isUserReserved == true && event.creator.id != authViewModel.currentUser?.id
        }
    }

    var body: some View {
        NavigationView {
            List {
                if !myCreatedEvents.isEmpty {
                    Section(header: Text("Events I Created")) {
                        ForEach(myCreatedEvents) { event in
                            NavigationLink(destination: EventDetailView(event: event)) {
                                EventRowView(event: event)
                            }
                        }
                    }
                }

                if !myReservedEvents.isEmpty {
                    Section(header: Text("Events I Joined")) {
                        ForEach(myReservedEvents) { event in
                            NavigationLink(destination: EventDetailView(event: event)) {
                                EventRowView(event: event)
                            }
                        }
                    }
                }

                if myCreatedEvents.isEmpty && myReservedEvents.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "star.slash")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        Text("No events yet")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text("Create or join an event to get started!")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                }
            }
            .navigationTitle("My Events")
            .refreshable {
                await eventsViewModel.refreshEvents()
            }
        }
    }
}

#Preview {
    MyEventsView()
        .environmentObject(EventsViewModel())
        .environmentObject(AuthViewModel())
}
