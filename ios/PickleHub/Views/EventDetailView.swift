import SwiftUI

struct EventDetailView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var eventsViewModel: EventsViewModel
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showingChat = false
    @State private var showingAlert = false
    @State private var alertMessage = ""
    @State private var selectedUser: User?
    @State private var showingUserProfile = false
    @State private var showingDeleteAlert = false

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

                    if let region = event.region {
                        HStack {
                            Image(systemName: "map")
                            Text(region)
                        }
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
                    HStack(spacing: 12) {
                        // Creator profile image (tappable)
                        Button(action: {
                            selectedUser = event.creator
                            showingUserProfile = true
                        }) {
                            if let profileImageURL = event.creator.profileImageURL {
                                AsyncImage(url: profileImageURL) { phase in
                                    switch phase {
                                    case .success(let image):
                                        image
                                            .resizable()
                                            .scaledToFill()
                                            .frame(width: 40, height: 40)
                                            .clipShape(Circle())
                                    case .failure(_), .empty:
                                        Image(systemName: "person.circle.fill")
                                            .resizable()
                                            .frame(width: 40, height: 40)
                                            .foregroundColor(.gray)
                                    @unknown default:
                                        EmptyView()
                                    }
                                }
                            } else {
                                Image(systemName: "person.circle.fill")
                                    .resizable()
                                    .frame(width: 40, height: 40)
                                    .foregroundColor(.gray)
                            }
                        }
                        .buttonStyle(.plain)
                        Text(event.creator.displayName)
                    }
                }

                Divider()

                // Participants
                if !event.reservations.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Participants (\(event.reservations.count))")
                            .font(.headline)

                        ForEach(event.reservations) { reservation in
                            HStack(spacing: 12) {
                                // Participant profile image (tappable)
                                Button(action: {
                                    selectedUser = reservation.user
                                    showingUserProfile = true
                                }) {
                                    if let profileImageURL = reservation.user.profileImageURL {
                                        AsyncImage(url: profileImageURL) { phase in
                                            switch phase {
                                            case .success(let image):
                                                image
                                                    .resizable()
                                                    .scaledToFill()
                                                    .frame(width: 32, height: 32)
                                                    .clipShape(Circle())
                                            case .failure(_), .empty:
                                                Image(systemName: "person.circle")
                                                    .resizable()
                                                    .frame(width: 32, height: 32)
                                                    .foregroundColor(.gray)
                                            @unknown default:
                                                EmptyView()
                                            }
                                        }
                                    } else {
                                        Image(systemName: "person.circle")
                                            .resizable()
                                            .frame(width: 32, height: 32)
                                            .foregroundColor(.gray)
                                    }
                                }
                                .buttonStyle(.plain)
                                Text(reservation.user.displayName)
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

                    // Delete button (for creator only)
                    if isCreator {
                        Button(action: {
                            showingDeleteAlert = true
                        }) {
                            HStack {
                                Spacer()
                                Text("Delete Event")
                                    .foregroundColor(.red)
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                            .padding()
                            .background(Color.red.opacity(0.1))
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
        .sheet(isPresented: $showingUserProfile) {
            if let user = selectedUser {
                UserProfileView(user: user)
            }
        }
        .alert("Notification", isPresented: $showingAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(alertMessage)
        }
        .alert("Delete Event", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                deleteEvent()
            }
        } message: {
            Text("Are you sure you want to delete this event? This action cannot be undone.")
        }
    }

    private func makeReservation() {
        Task {
            do {
                print("📝 Making reservation for event: \(event.id)")
                try await eventsViewModel.makeReservation(eventId: event.id)
                print("✅ Reservation successful!")
                alertMessage = "Reservation successful!"
                showingAlert = true
            } catch {
                print("❌ Reservation failed: \(error)")
                if let apiError = error as? APIError {
                    print("❌ API Error: \(apiError.errorDescription ?? "unknown")")
                }
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

    private func deleteEvent() {
        Task {
            do {
                try await eventsViewModel.deleteEvent(id: event.id)
                dismiss()
            } catch {
                alertMessage = "Failed to delete event: \(error.localizedDescription)"
                showingAlert = true
            }
        }
    }
}
