import SwiftUI

struct EventDetailView: View {
    @EnvironmentObject var eventsViewModel: EventsViewModel
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showingChat = false
    @State private var showingAlert = false
    @State private var alertMessage = ""

    let event: Event

    private var isCreator: Bool {
        event.creator.id == authViewModel.currentUser?.id
    }

    private var userReservation: Reservation? {
        event.reservations.first { $0.user.id == authViewModel.currentUser?.id }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(event.title)
                            .font(.title)
                            .fontWeight(.bold)
                        Spacer()
                        Text(event.skillLevelEmoji)
                            .font(.title)
                    }

                    Text(event.skillLevel.capitalized)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                Divider()

                // Time & Location
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Image(systemName: "calendar")
                        Text(event.formattedDate)
                    }

                    HStack {
                        Image(systemName: "mappin.circle")
                        Text(event.location)
                    }

                    HStack {
                        Image(systemName: "person.2")
                        Text("\(event.availableSpots) of \(event.maxParticipants) spots available")
                            .foregroundColor(event.availableSpots > 0 ? .green : .red)
                    }
                }
                .font(.body)

                Divider()

                // Description
                VStack(alignment: .leading, spacing: 8) {
                    Text("Description")
                        .font(.headline)
                    Text(event.description)
                        .font(.body)
                }

                Divider()

                // Creator
                VStack(alignment: .leading, spacing: 8) {
                    Text("Organized by")
                        .font(.headline)
                    HStack {
                        Image(systemName: "person.circle.fill")
                            .font(.title2)
                        Text(event.creator.name)
                    }
                }

                Divider()

                // Participants
                if !event.reservations.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Participants (\(event.reservations.count))")
                            .font(.headline)

                        ForEach(event.reservations) { reservation in
                            HStack {
                                Image(systemName: "person.circle")
                                Text(reservation.user.name)
                                Spacer()
                                if reservation.user.id == authViewModel.currentUser?.id {
                                    Text("You")
                                        .font(.caption)
                                        .foregroundColor(.green)
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }

                    Divider()
                }

                // Actions
                VStack(spacing: 12) {
                    if !isCreator {
                        if let reservation = userReservation {
                            Button(action: {
                                cancelReservation(reservationId: reservation.id)
                            }) {
                                Text("Cancel Reservation")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.red)
                                    .cornerRadius(12)
                            }
                        } else if event.availableSpots > 0 {
                            Button(action: {
                                makeReservation()
                            }) {
                                Text("Reserve Spot")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.green)
                                    .cornerRadius(12)
                            }
                        } else {
                            Text("Event is full")
                                .font(.headline)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.gray)
                                .cornerRadius(12)
                        }
                    }

                    // Chat button (for participants and creator)
                    if isCreator || userReservation != nil {
                        Button(action: {
                            showingChat = true
                        }) {
                            HStack {
                                Image(systemName: "message.fill")
                                Text("Open Chat")
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(12)
                        }
                    }
                }

                Spacer()
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showingChat) {
            ChatView(eventId: event.id, eventTitle: event.title)
        }
        .alert("Notification", isPresented: $showingAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(alertMessage)
        }
    }

    private func makeReservation() {
        Task {
            do {
                try await eventsViewModel.makeReservation(eventId: event.id)
                alertMessage = "Reservation successful!"
                showingAlert = true
            } catch {
                alertMessage = "Failed to make reservation: \(error.localizedDescription)"
                showingAlert = true
            }
        }
    }

    private func cancelReservation(reservationId: String) {
        Task {
            do {
                try await eventsViewModel.cancelReservation(reservationId: reservationId)
                alertMessage = "Reservation cancelled"
                showingAlert = true
            } catch {
                alertMessage = "Failed to cancel reservation: \(error.localizedDescription)"
                showingAlert = true
            }
        }
    }
}
