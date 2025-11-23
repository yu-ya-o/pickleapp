import SwiftUI

struct MyEventsView: View {
    @EnvironmentObject var eventsViewModel: EventsViewModel
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var selectedUser: User?
    @State private var showingUserProfile = false

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
                                ModernEventRowView(event: event, onProfileTap: {
                                    selectedUser = event.creator
                                    showingUserProfile = true
                                })
                            }
                            .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                            .listRowSeparator(.hidden)
                        }
                    }
                }

                if !myReservedEvents.isEmpty {
                    Section(header: Text("Events I Joined")) {
                        ForEach(myReservedEvents) { event in
                            NavigationLink(destination: EventDetailView(event: event)) {
                                ModernEventRowView(event: event, onProfileTap: {
                                    selectedUser = event.creator
                                    showingUserProfile = true
                                })
                            }
                            .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                            .listRowSeparator(.hidden)
                        }
                    }
                }

                if myCreatedEvents.isEmpty && myReservedEvents.isEmpty {
                    VStack(spacing: Spacing.lg) {
                        Image(systemName: "star.slash")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        Text("No events yet")
                            .font(.headlineMedium)
                            .foregroundColor(.secondary)
                        Text("Create or join an event to get started!")
                            .font(.bodyMedium)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                }
            }
            .listStyle(.plain)
            .navigationTitle("My Events")
            .refreshable {
                await eventsViewModel.refreshEvents()
            }
            .sheet(isPresented: $showingUserProfile) {
                if let user = selectedUser {
                    UserProfileView(user: user)
                }
            }
        }
    }
}

#Preview {
    MyEventsView()
        .environmentObject(EventsViewModel())
        .environmentObject(AuthViewModel())
}
