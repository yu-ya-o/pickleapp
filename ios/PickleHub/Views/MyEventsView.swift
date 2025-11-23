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
            VStack(spacing: 0) {
                // カスタムタイトル
                Text("PickleHub")
                    .font(.system(size: 28, weight: .black, design: .default))
                    .italic()
                    .kerning(-0.5)
                    .foregroundColor(.black)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.white)

                Divider()

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
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding()
                } else {
                    List {
                        if !myCreatedEvents.isEmpty {
                            Section(header: Text("Events I Created")) {
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
                            Section(header: Text("Events I Joined")) {
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
                    }
                    .listStyle(.plain)
                    .refreshable {
                        await eventsViewModel.refreshEvents()
                    }
                }
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showingUserProfile) {
                if let user = selectedUser {
                    UserProfileView(user: user)
                }
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
