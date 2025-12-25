import SwiftUI

struct EditEventView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var eventsViewModel: EventsViewModel

    let event: Event

    @State private var title: String
    @State private var description: String
    @State private var location: String
    @State private var region: String
    @State private var startDate: Date
    @State private var endDate: Date
    @State private var maxParticipants: Int
    @State private var skillLevel: String
    @State private var priceInput: String

    @State private var isLoading = false
    @State private var showingError = false
    @State private var errorMessage = ""

    let skillLevels = ["beginner", "intermediate", "advanced", "all"]

    init(event: Event) {
        self.event = event
        _title = State(initialValue: event.title)
        _description = State(initialValue: event.description)
        _location = State(initialValue: event.location)
        _region = State(initialValue: event.region ?? "")
        // Use actual event dates, not current date
        _startDate = State(initialValue: event.startDate ?? Date())
        _endDate = State(initialValue: event.endDate ?? Date().addingTimeInterval(3600))
        _maxParticipants = State(initialValue: event.maxParticipants)
        _skillLevel = State(initialValue: event.skillLevel)
        _priceInput = State(initialValue: event.price != nil ? String(event.price!) : "")
    }

    var isEventPast: Bool {
        guard let startDate = event.startDate else { return false }
        return startDate < Date()
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
            if isEventPast {
                VStack(spacing: 20) {
                    Image(systemName: "clock.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.orange)
                    Text("開始時間が過ぎたイベントは編集できません")
                        .font(.headline)
                        .multilineTextAlignment(.center)
                    Button("閉じる") {
                        dismiss()
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding()
            } else {
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
                    DatePicker("開始", selection: $startDate, in: Date()..., displayedComponents: [.date, .hourAndMinute], minuteInterval: 5)
                    DatePicker("終了", selection: $endDate, in: Date()..., displayedComponents: [.date, .hourAndMinute], minuteInterval: 5)
                }

                Section(header: Text("定員")) {
                    Stepper("定員: \(maxParticipants)人", value: $maxParticipants, in: 2...100)
                }

                Section(header: Text("料金")) {
                    TextField("料金（円）", text: $priceInput)
                        .keyboardType(.numberPad)
                    Text("無料の場合は空欄にしてください")
                        .font(.caption)
                        .foregroundColor(.secondary)
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
                    Button(action: updateEvent) {
                        if isLoading {
                            HStack {
                                Spacer()
                                ProgressView()
                                Spacer()
                            }
                        } else {
                            HStack {
                                Spacer()
                                Text("変更を保存")
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                        }
                    }
                    .disabled(!isFormValid || isLoading)
                }
            }
            .navigationTitle("イベントを編集")
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
    }

    private var isFormValid: Bool {
        !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !location.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        startDate < endDate
    }

    private func updateEvent() {
        Task {
            isLoading = true

            do {
                let price = priceInput.isEmpty ? nil : Int(priceInput)

                try await eventsViewModel.updateEvent(
                    id: event.id,
                    title: title,
                    description: description,
                    location: location,
                    region: region.isEmpty ? nil : region,
                    startTime: startDate,
                    endTime: endDate,
                    maxParticipants: maxParticipants,
                    skillLevel: skillLevel,
                    price: price
                )
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
                showingError = true
                isLoading = false
            }
        }
    }
}
