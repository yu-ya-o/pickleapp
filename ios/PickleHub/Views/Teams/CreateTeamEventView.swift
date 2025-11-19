import SwiftUI

struct CreateTeamEventView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var viewModel: TeamEventsViewModel

    @State private var title = ""
    @State private var description = ""
    @State private var location = ""
    @State private var startDate = Date().addingTimeInterval(3600) // 1 hour from now
    @State private var endDate = Date().addingTimeInterval(7200) // 2 hours from now
    @State private var hasCapacityLimit = true
    @State private var maxParticipants = 8

    @State private var isLoading = false
    @State private var showingError = false
    @State private var errorMessage = ""

    let teamId: String

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
                    Toggle("Set participant limit", isOn: $hasCapacityLimit)

                    if hasCapacityLimit {
                        Stepper("Max Participants: \(maxParticipants)", value: $maxParticipants, in: 2...50)
                    } else {
                        Text("Unlimited participants")
                            .font(.subheadline)
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
                                Text("Create Event")
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                        }
                    }
                    .disabled(!isFormValid || isLoading)
                }
            }
            .navigationTitle("Create Team Event")
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
                try await viewModel.createEvent(
                    title: title,
                    description: description,
                    location: location,
                    startTime: startDate,
                    endTime: endDate,
                    maxParticipants: hasCapacityLimit ? maxParticipants : nil
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
