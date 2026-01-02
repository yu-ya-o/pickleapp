import SwiftUI

struct CreateTeamEventView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var viewModel: TeamEventsViewModel

    @State private var title = ""
    @State private var description = ""
    @State private var location = ""
    @State private var region = ""
    @State private var startDate = Date().addingTimeInterval(3600) // 1 hour from now
    @State private var endDate = Date().addingTimeInterval(7200) // 2 hours from now
    @State private var hasCapacityLimit = true
    @State private var maxParticipants = 8
    @State private var skillLevel = "all"
    @State private var priceInput = ""
    @State private var visibility = "private"

    @State private var isLoading = false
    @State private var showingError = false
    @State private var errorMessage = ""

    let teamId: String
    let editingEvent: TeamEvent?
    let duplicatingEvent: TeamEvent?
    let skillLevels = ["beginner", "intermediate", "advanced", "all"]
    var onEventCreated: ((TeamEvent) -> Void)? = nil

    init(teamId: String, editingEvent: TeamEvent? = nil, duplicatingEvent: TeamEvent? = nil, onEventCreated: ((TeamEvent) -> Void)? = nil) {
        self.teamId = teamId
        self.editingEvent = editingEvent
        self.duplicatingEvent = duplicatingEvent
        self.onEventCreated = onEventCreated

        // Initialize state from editing event if provided
        if let event = editingEvent {
            _title = State(initialValue: event.title)
            _description = State(initialValue: event.description)
            _location = State(initialValue: event.location)
            _region = State(initialValue: event.region ?? "")

            // Parse dates from ISO8601 strings with proper format options
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

            if let startTime = formatter.date(from: event.startTime) {
                _startDate = State(initialValue: startTime)
            } else {
                // Fallback: try without fractional seconds
                formatter.formatOptions = [.withInternetDateTime]
                _startDate = State(initialValue: formatter.date(from: event.startTime) ?? Date().addingTimeInterval(3600))
            }

            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let endTime = formatter.date(from: event.endTime) {
                _endDate = State(initialValue: endTime)
            } else {
                // Fallback: try without fractional seconds
                formatter.formatOptions = [.withInternetDateTime]
                _endDate = State(initialValue: formatter.date(from: event.endTime) ?? Date().addingTimeInterval(7200))
            }

            _hasCapacityLimit = State(initialValue: event.maxParticipants != nil)
            _maxParticipants = State(initialValue: event.maxParticipants ?? 8)
            _skillLevel = State(initialValue: event.skillLevel ?? "all")
            _priceInput = State(initialValue: event.price != nil ? String(event.price!) : "")
            _visibility = State(initialValue: event.visibility)
        } else if let event = duplicatingEvent {
            // Initialize state from duplicating event
            _title = State(initialValue: event.title)
            _description = State(initialValue: event.description)
            _location = State(initialValue: event.location)
            _region = State(initialValue: event.region ?? "")

            // Parse dates and adjust to tomorrow
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

            var originalStartDate = formatter.date(from: event.startTime)
            if originalStartDate == nil {
                // Fallback: try without fractional seconds
                formatter.formatOptions = [.withInternetDateTime]
                originalStartDate = formatter.date(from: event.startTime)
            }

            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            var originalEndDate = formatter.date(from: event.endTime)
            if originalEndDate == nil {
                // Fallback: try without fractional seconds
                formatter.formatOptions = [.withInternetDateTime]
                originalEndDate = formatter.date(from: event.endTime)
            }

            // Adjust dates to tomorrow at the same time
            if let startTime = originalStartDate, let endTime = originalEndDate {
                _startDate = State(initialValue: adjustDateToTomorrow(from: startTime))
                _endDate = State(initialValue: adjustDateToTomorrow(from: endTime))
            }

            _hasCapacityLimit = State(initialValue: event.maxParticipants != nil)
            _maxParticipants = State(initialValue: event.maxParticipants ?? 8)
            _skillLevel = State(initialValue: event.skillLevel ?? "all")
            _priceInput = State(initialValue: event.price != nil ? String(event.price!) : "")
            _visibility = State(initialValue: event.visibility)
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

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("イベント詳細")) {
                    TextField("イベントタイトル", text: $title)
                    TextField("説明", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                    TextField("場所", text: $location)
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

                Section(header: Text("公開設定")) {
                    Picker("イベントの公開設定", selection: $visibility) {
                        Text("プライベート（チームのみ）").tag("private")
                        Text("パブリック（全体に公開）").tag("public")
                    }
                    .pickerStyle(.menu)

                    if visibility == "private" {
                        Text("このイベントはチームメンバーのみに表示されます")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    } else {
                        Text("このイベントは全ユーザーの公開イベント一覧に表示されます")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Section {
                    Button(action: saveEvent) {
                        if isLoading {
                            HStack {
                                Spacer()
                                ProgressView()
                                Spacer()
                            }
                        } else {
                            HStack {
                                Spacer()
                                Text(editingEvent != nil ? "変更を保存" : "イベントを作成")
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                        }
                    }
                    .disabled(!isFormValid || isLoading)
                }
            }
            .navigationTitle(editingEvent != nil ? "チームイベント編集" : "チームイベント作成")
            .navigationBarTitleDisplayMode(.inline)
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
        }
    }

    private var isFormValid: Bool {
        !title.isEmpty &&
        !description.isEmpty &&
        startDate < endDate
    }

    private func saveEvent() {
        Task {
            isLoading = true

            do {
                let price = priceInput.isEmpty ? nil : Int(priceInput)
                var createdEvent: TeamEvent?

                if let event = editingEvent {
                    // Update existing event
                    try await viewModel.updateEvent(
                        eventId: event.id,
                        title: title,
                        description: description,
                        location: location,
                        region: region.isEmpty ? nil : region,
                        startTime: startDate,
                        endTime: endDate,
                        maxParticipants: hasCapacityLimit ? maxParticipants : nil,
                        price: price,
                        skillLevel: skillLevel,
                        visibility: visibility
                    )
                } else {
                    // Create new event
                    createdEvent = try await viewModel.createEvent(
                        title: title,
                        description: description,
                        location: location,
                        region: region.isEmpty ? nil : region,
                        startTime: startDate,
                        endTime: endDate,
                        maxParticipants: hasCapacityLimit ? maxParticipants : nil,
                        price: price,
                        skillLevel: skillLevel,
                        visibility: visibility
                    )
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
}

#Preview {
    CreateTeamEventView(teamId: "test")
        .environmentObject(TeamEventsViewModel(teamId: "test"))
}
