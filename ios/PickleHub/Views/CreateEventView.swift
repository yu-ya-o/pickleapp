import SwiftUI

struct CreateEventView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var eventsViewModel: EventsViewModel
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var teamsViewModel = TeamsViewModel()

    @State private var title = ""
    @State private var description = ""
    @State private var location = ""
    @State private var selectedLocation: LocationData?
    @State private var region = ""
    @State private var startDate = Date().addingTimeInterval(3600) // 1 hour from now
    @State private var endDate = Date().addingTimeInterval(7200) // 2 hours from now
    @State private var hasCapacityLimit = true
    @State private var maxParticipants = 8
    @State private var skillLevel = "beginner"
    @State private var priceInput = ""

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

    let duplicatingEvent: Event?
    let skillLevels = ["beginner", "intermediate", "advanced", "all"]
    var onEventCreated: ((Event) -> Void)? = nil

    init(duplicatingEvent: Event? = nil, onEventCreated: ((Event) -> Void)? = nil) {
        self.onEventCreated = onEventCreated
        self.duplicatingEvent = duplicatingEvent

        // Initialize state from duplicating event if provided
        if let event = duplicatingEvent {
            _title = State(initialValue: event.title)
            _description = State(initialValue: event.description)
            _location = State(initialValue: event.location)
            _region = State(initialValue: event.region ?? "")
            _maxParticipants = State(initialValue: event.maxParticipants)
            _skillLevel = State(initialValue: event.skillLevel)
            _priceInput = State(initialValue: event.price != nil ? String(event.price!) : "")

            // Force personal event for duplication
            _selectedOrganizer = State(initialValue: .personal)

            // Adjust dates to tomorrow at the same time
            if let originalStartDate = event.startDate,
               let originalEndDate = event.endDate {
                _startDate = State(initialValue: adjustDateToTomorrow(from: originalStartDate))
                _endDate = State(initialValue: adjustDateToTomorrow(from: originalEndDate))
            }
        }
    }

    private func adjustDateToTomorrow(from originalDate: Date) -> Date {
        // If the original date is in the future, keep it as is
        if originalDate > Date() {
            return originalDate
        }

        // If the original date is in the past, adjust to tomorrow at the same time
        let calendar = Calendar.current
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: Date())!

        let timeComponents = calendar.dateComponents([.hour, .minute], from: originalDate)
        let tomorrowComponents = calendar.dateComponents([.year, .month, .day], from: tomorrow)

        var newComponents = DateComponents()
        newComponents.year = tomorrowComponents.year
        newComponents.month = tomorrowComponents.month
        newComponents.day = tomorrowComponents.day
        newComponents.hour = timeComponents.hour
        newComponents.minute = timeComponents.minute

        return calendar.date(from: newComponents) ?? tomorrow
    }

    func skillLevelLabel(_ level: String) -> String {
        switch level {
        case "beginner": return "初級"
        case "intermediate": return "中級"
        case "advanced": return "上級"
        case "all": return "全レベル"
        default: return level
        }
    }

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
                        .pickerStyle(.menu)
                    }
                }

                Section(header: Text("イベント詳細")) {
                    TextField("イベントタイトル", text: $title)
                    TextField("説明", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                    LocationSearchView(locationName: $location, selectedLocation: $selectedLocation)
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

                Section(header: Text("日時")) {
                    DatePicker("開始時刻", selection: $startDate, in: Date()...)
                    DatePicker("終了時刻", selection: $endDate, in: startDate...)
                }

                Section(header: Text("参加者")) {
                    Toggle("参加人数制限を設定", isOn: $hasCapacityLimit)

                    if hasCapacityLimit {
                        Stepper("最大参加者数: \(maxParticipants)", value: $maxParticipants, in: 2...50)
                    } else {
                        Text("参加人数無制限")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }

                Section(header: Text("料金")) {
                    HStack {
                        TextField("無料の場合は空欄", text: $priceInput)
                            .keyboardType(.numberPad)
                        Text("円")
                    }
                }

                Section(header: Text("スキルレベル")) {
                    Picker("スキルレベル", selection: $skillLevel) {
                        ForEach(skillLevels, id: \.self) { level in
                            Text(skillLevelLabel(level)).tag(level)
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
                                Text("イベントを作成")
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                        }
                    }
                    .disabled(!isFormValid || isLoading)
                }
            }
            .navigationTitle("イベント作成")
            .navigationBarTitleDisplayMode(.inline)
            .onChange(of: selectedLocation) { newValue in
                print("📍 CreateEventView: selectedLocation changed")
                print("   Name: \(newValue?.name ?? "nil")")
                print("   Address: \(newValue?.address ?? "nil")")
                print("   Lat: \(newValue?.latitude ?? 0), Lon: \(newValue?.longitude ?? 0)")
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("キャンセル") {
                        dismiss()
                    }
                }
            }
            .alert("エラー", isPresented: $showingError) {
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
        !region.isEmpty &&
        startDate < endDate
    }

    private func createEvent() {
        Task {
            isLoading = true

            // Debug logging
            print("📍 Creating event with location data:")
            print("   locationName: \(location)")
            print("   selectedLocation: \(selectedLocation?.name ?? "nil")")
            print("   address: \(selectedLocation?.address ?? "nil")")
            print("   latitude: \(selectedLocation?.latitude ?? 0)")
            print("   longitude: \(selectedLocation?.longitude ?? 0)")

            do {
                var createdEvent: Event?
                switch selectedOrganizer {
                case .personal:
                    // Create personal event
                    let price = priceInput.isEmpty ? nil : Int(priceInput)
                    createdEvent = try await eventsViewModel.createEvent(
                        title: title,
                        description: description,
                        location: location,
                        address: selectedLocation?.address,
                        latitude: selectedLocation?.latitude,
                        longitude: selectedLocation?.longitude,
                        region: region.isEmpty ? nil : region,
                        startTime: startDate,
                        endTime: endDate,
                        maxParticipants: hasCapacityLimit ? maxParticipants : 999,
                        skillLevel: skillLevel,
                        price: price,
                        skipArrayInsertion: onEventCreated != nil
                    )

                case .team(let teamId):
                    // Create team event
                    try await createTeamEvent(teamId: teamId)
                }

                // Call the callback BEFORE potentially dismissing
                if let event = createdEvent {
                    onEventCreated?(event)
                }

                // Only dismiss if no callback was provided (parent will handle dismissal)
                if onEventCreated == nil {
                    dismiss()
                }
            } catch {
                errorMessage = error.localizedDescription
                showingError = true
                isLoading = false
            }
        }
    }

    private func createTeamEvent(teamId: String) async throws {
        let formatter = ISO8601DateFormatter()
        let price = priceInput.isEmpty ? nil : Int(priceInput)

        let request = CreateTeamEventRequest(
            title: title,
            description: description,
            location: location,
            address: selectedLocation?.address,
            latitude: selectedLocation?.latitude,
            longitude: selectedLocation?.longitude,
            region: region.isEmpty ? nil : region,
            startTime: formatter.string(from: startDate),
            endTime: formatter.string(from: endDate),
            maxParticipants: hasCapacityLimit ? maxParticipants : nil,
            price: price,
            skillLevel: skillLevel,
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
