import SwiftUI

struct CreateEventView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var eventsViewModel: EventsViewModel
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var teamsViewModel = TeamsViewModel()

    @State private var title = ""
    @State private var description = ""
    @State private var location = ""
    @State private var region = ""
    @State private var startDate = Date().addingTimeInterval(3600) // 1 hour from now
    @State private var endDate = Date().addingTimeInterval(7200) // 2 hours from now
    @State private var maxParticipants = 8
    @State private var skillLevel = "beginner"

    // Organizer selection
    enum OrganizerType: Hashable {
        case personal
        case team(String) // teamId
    }
    @State private var selectedOrganizer: OrganizerType = .personal

    // Team event visibility
    @State private var teamEventVisibility = "public" // "public" or "private"

    @State private var isLoading = false
    @State private var showingError = false
    @State private var errorMessage = ""

    let skillLevels = ["beginner", "intermediate", "advanced", "all"]

    var isTeamEvent: Bool {
        if case .team = selectedOrganizer {
            return true
        }
        return false
    }

    // Filter teams where user can create events (owner or admin)
    var eligibleTeams: [Team] {
        teamsViewModel.myTeams.filter { team in
            team.userRole == "owner" || team.userRole == "admin"
        }
    }

    var body: some View {
        NavigationView {
            Form {
                // Organizer Section
                Section(header: Text("主催者")) {
                    Picker("主催", selection: $selectedOrganizer) {
                        Text("自分").tag(OrganizerType.personal)

                        ForEach(eligibleTeams, id: \.id) { team in
                            Text(team.name).tag(OrganizerType.team(team.id))
                        }
                    }
                    .pickerStyle(.menu)
                }

                // Team Event Visibility (only show for team events)
                if isTeamEvent {
                    Section(header: Text("公開範囲")) {
                        Picker("公開設定", selection: $teamEventVisibility) {
                            Text("全体公開").tag("public")
                            Text("チームのみ公開").tag("private")
                        }
                        .pickerStyle(.segmented)
                    }
                }

                Section(header: Text("Event Details")) {
                    TextField("Event Title", text: $title)
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                    TextField("Location", text: $location)
                }

                Section(header: Text("地域")) {
                    Picker("都道府県を選択", selection: $region) {
                        Text("選択してください").tag("")
                        ForEach(Prefectures.all, id: \.self) { prefecture in
                            Text(prefecture).tag(prefecture)
                        }
                    }
                    .pickerStyle(.menu)
                }

                Section(header: Text("Date & Time")) {
                    DatePicker("Start Time", selection: $startDate, in: Date()...)
                    DatePicker("End Time", selection: $endDate, in: startDate...)
                }

                Section(header: Text("Participants")) {
                    Stepper("Max Participants: \(maxParticipants)", value: $maxParticipants, in: 2...20)
                }

                Section(header: Text("Skill Level")) {
                    Picker("Skill Level", selection: $skillLevel) {
                        ForEach(skillLevels, id: \.self) { level in
                            Text(level.capitalized).tag(level)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section {
                    Button(action: createEvent) {
                        if isLoading {
                            HStack {
                                Spacer()
                                ProgressView()
                                Spacer()
                            }
                        } else {
                            HStack {
                                Spacer()
                                Text("Create Event")
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                        }
                    }
                    .disabled(!isFormValid || isLoading)
                }
            }
            .navigationTitle("Create Event")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .alert("Error", isPresented: $showingError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage)
            }
            .task {
                await teamsViewModel.fetchMyTeams()
            }
        }
    }

    private var isFormValid: Bool {
        !title.isEmpty &&
        !description.isEmpty &&
        !location.isEmpty &&
        startDate < endDate
    }

    private func createEvent() {
        Task {
            isLoading = true

            do {
                switch selectedOrganizer {
                case .personal:
                    // Create personal event
                    try await eventsViewModel.createEvent(
                        title: title,
                        description: description,
                        location: location,
                        region: region.isEmpty ? nil : region,
                        startTime: startDate,
                        endTime: endDate,
                        maxParticipants: maxParticipants,
                        skillLevel: skillLevel
                    )

                case .team(let teamId):
                    // Create team event
                    try await createTeamEvent(teamId: teamId)
                }
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
                showingError = true
                isLoading = false
            }
        }
    }

    private func createTeamEvent(teamId: String) async throws {
        let formatter = ISO8601DateFormatter()

        let request = CreateTeamEventRequest(
            title: title,
            description: description,
            location: location,
            region: region.isEmpty ? nil : region,
            startTime: formatter.string(from: startDate),
            endTime: formatter.string(from: endDate),
            maxParticipants: maxParticipants,
            visibility: teamEventVisibility
        )

        _ = try await APIClient.shared.createTeamEvent(teamId: teamId, request: request)

        // Refresh events list
        await eventsViewModel.fetchTeamEvents()
    }
}

#Preview {
    CreateEventView()
        .environmentObject(EventsViewModel())
        .environmentObject(AuthViewModel())
}
