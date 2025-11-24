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
    @State private var visibility = "private"

    @State private var isLoading = false
    @State private var showingError = false
    @State private var errorMessage = ""

    let teamId: String
    let skillLevels = ["beginner", "intermediate", "advanced", "all"]

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
                        Text("このイベントは全ユーザーの通常イベント一覧に表示されます")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
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
            .navigationTitle("チームイベント作成")
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
        !location.isEmpty &&
        startDate < endDate
    }

    private func createEvent() {
        Task {
            isLoading = true

            do {
                try await viewModel.createEvent(
                    title: title,
                    description: description,
                    location: location,
                    region: region.isEmpty ? nil : region,
                    startTime: startDate,
                    endTime: endDate,
                    maxParticipants: hasCapacityLimit ? maxParticipants : nil,
                    skillLevel: skillLevel,
                    visibility: visibility
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

#Preview {
    CreateTeamEventView(teamId: "test")
        .environmentObject(TeamEventsViewModel(teamId: "test"))
}
