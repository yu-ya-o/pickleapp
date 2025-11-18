import SwiftUI

struct CreateEventView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var eventsViewModel: EventsViewModel

    @State private var title = ""
    @State private var description = ""
    @State private var location = ""
    @State private var startDate = Date().addingTimeInterval(3600) // 1 hour from now
    @State private var endDate = Date().addingTimeInterval(7200) // 2 hours from now
    @State private var maxParticipants = 8
    @State private var skillLevel = "beginner"

    @State private var isLoading = false
    @State private var showingError = false
    @State private var errorMessage = ""

    let skillLevels = ["beginner", "intermediate", "advanced", "all"]

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Event Details")) {
                    TextField("Event Title", text: $title)
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                    TextField("Location", text: $location)
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
                try await eventsViewModel.createEvent(
                    title: title,
                    description: description,
                    location: location,
                    startTime: startDate,
                    endTime: endDate,
                    maxParticipants: maxParticipants,
                    skillLevel: skillLevel
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
    CreateEventView()
        .environmentObject(EventsViewModel())
}
