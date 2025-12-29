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
    @State private var showingReserveConfirm = false
    @State private var showingCancelConfirm = false
    @State private var showingCloseEventAlert = false
    @State private var showingEditEvent = false
    @State private var showingDuplicateEvent = false
    @State private var reservationToCancel: String?
    @State private var currentEvent: Event

    let initialEvent: Event

    init(event: Event) {
        self.initialEvent = event
        self._currentEvent = State(initialValue: event)
    }

    // Use currentEvent as the active event
    private var event: Event {
        currentEvent
    }

    private var isCreator: Bool {
        currentEvent.creator.id == authViewModel.currentUser?.id
    }

    private var isClosed: Bool {
        currentEvent.status == "completed"
    }

    private var isEventPast: Bool {
        guard let startDate = event.startDate else { return false }
        return startDate < Date()
    }

    private func formattedTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "ja_JP")
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }

    private func skillLevelLabel(_ level: String) -> String {
        switch level {
        case "beginner": return "初級"
        case "intermediate": return "中級"
        case "advanced": return "上級"
        case "all": return "全レベル"
        default: return level
        }
    }

    private var userReservation: Reservation? {
        event.reservations.first { $0.user.id == authViewModel.currentUser?.id }
    }

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Color.clear
                        .frame(height: 1)
                        .id("top")
                    // Default Header Image
                    Rectangle()
                    .fill(LinearGradient(
                        gradient: Gradient(colors: [Color.blue.opacity(0.6), Color.purple.opacity(0.6)]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))
                    .frame(height: 200)
                    .frame(maxWidth: .infinity)
                    .overlay(
                        VStack {
                            Image(systemName: "figure.pickleball")
                                .font(.system(size: 60))
                                .foregroundColor(.white.opacity(0.9))
                        }
                    )

                headerSection
                Divider()
                detailsSection
                Divider()
                creatorSection
                participantsSection
                Divider()
                actionButtons
                    .padding(.horizontal)
                Spacer()
            }
            }
            .onChange(of: currentEvent.id) { _, newId in
                print("🔄 Scrolling to top for event: \(newId)")
                // Scroll to top immediately
                withAnimation {
                    proxy.scrollTo("top", anchor: .top)
                }
            }
        }
        .navigationTitle("イベント")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                if let shareURL = DeepLinkManager.shared.generateEventLink(eventId: event.id) {
                    ShareLink(
                        item: shareURL,
                        subject: Text("PickleHub イベント"),
                        message: Text("「\(event.title)」に参加しませんか？")
                    ) {
                        Image(systemName: "square.and.arrow.up")
                    }
                } else {
                    Button(action: {
                        alertMessage = "共有リンクの生成に失敗しました。"
                        showingAlert = true
                    }) {
                        Image(systemName: "square.and.arrow.up")
                    }
                }
            }
        }
        .sheet(isPresented: $showingEditEvent) {
            EditEventView(event: event)
                .environmentObject(eventsViewModel)
        }
        .sheet(isPresented: $showingDuplicateEvent) {
            CreateEventView(duplicatingEvent: event) { newEvent in
                print("✅ Duplicate event created: \(newEvent.id)")
                showingDuplicateEvent = false
                // Delay slightly to ensure sheet is closed before updating
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    print("🔄 Updating currentEvent to: \(newEvent.id)")
                    currentEvent = newEvent
                }
            }
            .environmentObject(eventsViewModel)
            .environmentObject(authViewModel)
        }
        .sheet(isPresented: $showingChat) {
            ChatView(eventId: event.id, eventTitle: event.title)
        }
        .sheet(isPresented: $showingUserProfile) {
            if let user = selectedUser {
                UserProfileView(user: user)
            }
        }
        .alert("通知", isPresented: $showingAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(alertMessage)
        }
        .alert("イベント削除", isPresented: $showingDeleteAlert) {
            Button("キャンセル", role: .cancel) {}
            Button("削除", role: .destructive) {
                deleteEvent()
            }
        } message: {
            Text("このイベントを削除してもよろしいですか？この操作は取り消せません。")
        }
        .alert("参加予約", isPresented: $showingReserveConfirm) {
            Button("キャンセル", role: .cancel) {}
            Button("予約する") {
                makeReservation()
            }
        } message: {
            Text("このイベントに参加予約しますか？")
        }
        .alert("予約キャンセル", isPresented: $showingCancelConfirm) {
            Button("キャンセルしない", role: .cancel) {}
            Button("予約をキャンセル", role: .destructive) {
                if let reservationId = reservationToCancel {
                    cancelReservation(reservationId: reservationId)
                }
            }
        } message: {
            Text("予約をキャンセルしてもよろしいですか？")
        }
        .alert("イベント締め切り", isPresented: $showingCloseEventAlert) {
            Button("キャンセル", role: .cancel) {}
            Button("締め切る", role: .destructive) {
                closeEvent()
            }
        } message: {
            Text("イベントを締め切りますか？これ以上新しい予約を受け付けなくなります。")
        }
    }

    @ViewBuilder
    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(event.title)
                .font(.title)
                .fontWeight(.bold)

            Text(skillLevelLabel(event.skillLevel))
                .font(.subheadline)
                .foregroundColor(.secondary)

            Text(event.description)
                .font(.body)
                .foregroundColor(.secondary)
                .padding(.top, 4)
        }
        .padding()
    }

    @ViewBuilder
    private var detailsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "calendar")
                if let endDate = event.endDate {
                    Text("\(event.formattedDate) 〜 \(formattedTime(endDate))")
                } else {
                    Text(event.formattedDate)
                }
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
                Text("\(event.reservations.count)/\(event.maxParticipants)人")
                    .foregroundColor(event.availableSpots > 0 ? .green : .red)
            }

            HStack {
                Image(systemName: "yensign.circle")
                if let price = event.price {
                    Text("¥\(price)")
                } else {
                    Text("無料")
                        .foregroundColor(.green)
                }
            }
        }
        .font(.body)
        .padding(.horizontal)
    }

    @ViewBuilder
    private var creatorSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("主催者")
                .font(.headline)
            HStack(spacing: 12) {
                Button(action: {
                    selectedUser = event.creator
                    showingUserProfile = true
                }) {
                    ProfileImageView(url: event.creator.profileImageURL, size: 40)
                }
                .buttonStyle(.plain)
                Text(event.creator.displayName)
                    .font(.body)
            }
        }
        .padding(.horizontal)
    }

    @ViewBuilder
    private var participantsSection: some View {
        if !event.reservations.isEmpty {
            Divider()

            VStack(alignment: .leading, spacing: 8) {
                Text("参加者 (\(event.reservations.count))")
                    .font(.headline)
                    .padding(.horizontal)

                ForEach(event.reservations) { reservation in
                    HStack(spacing: 12) {
                        Button(action: {
                            selectedUser = reservation.user
                            showingUserProfile = true
                        }) {
                            ProfileImageView(url: reservation.user.profileImageURL, size: 32)
                        }
                        .buttonStyle(.plain)
                        Text(reservation.user.displayName)
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 4)
                }
            }
        }
    }

    @ViewBuilder
    private var actionButtons: some View {
        VStack(spacing: 12) {
            // Closed event banner
            if isClosed {
                Text("締め切り済み")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.orange)
                    .cornerRadius(12)
            }

            // Chat button (available for everyone)
            Button(action: { showingChat = true }) {
                HStack {
                    Image(systemName: "message.fill")
                    Text("チャットを開く")
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .cornerRadius(12)
            }

            // Join/Leave buttons
            if let reservation = userReservation {
                Button(action: {
                    reservationToCancel = reservation.id
                    showingCancelConfirm = true
                }) {
                    Text("予約をキャンセル")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red)
                        .cornerRadius(12)
                }
            } else if isEventPast {
                Text("開始時間が過ぎました")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.gray)
                    .cornerRadius(12)
            } else if isClosed {
                Text("予約受付終了")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.gray)
                    .cornerRadius(12)
            } else if event.availableSpots > 0 {
                Button(action: {
                    showingReserveConfirm = true
                }) {
                    Text("参加予約する")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .cornerRadius(12)
                }
            } else {
                Text("満席です")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.gray)
                    .cornerRadius(12)
            }

            // Close event button (for creator only, if event is active)
            if isCreator && !isClosed {
                Button(action: {
                    showingCloseEventAlert = true
                }) {
                    HStack {
                        Spacer()
                        Image(systemName: "lock.fill")
                        Text("イベントを締め切る")
                            .fontWeight(.semibold)
                        Spacer()
                    }
                    .foregroundColor(.orange)
                    .padding()
                    .background(Color.orange.opacity(0.1))
                    .cornerRadius(12)
                }
            }

            // Edit button (for creator only, if not past)
            if isCreator && !isEventPast {
                Button(action: {
                    showingEditEvent = true
                }) {
                    HStack {
                        Spacer()
                        Image(systemName: "pencil")
                        Text("イベントを編集")
                            .fontWeight(.semibold)
                        Spacer()
                    }
                    .foregroundColor(.blue)
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(12)
                }
            }

            // Duplicate button (for creator only)
            if isCreator {
                Button(action: {
                    showingDuplicateEvent = true
                }) {
                    HStack {
                        Spacer()
                        Image(systemName: "doc.on.doc")
                        Text("イベントを複製")
                            .fontWeight(.semibold)
                        Spacer()
                    }
                    .foregroundColor(.green)
                    .padding()
                    .background(Color.green.opacity(0.1))
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
                        Text("イベントを削除")
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
    }

    private func makeReservation() {
        Task {
            do {
                print("📝 Making reservation for event: \(event.id)")
                try await eventsViewModel.makeReservation(eventId: event.id)
                print("✅ Reservation successful!")
                alertMessage = "予約が完了しました！"
                showingAlert = true
            } catch {
                print("❌ Reservation failed: \(error)")
                if let apiError = error as? APIError {
                    print("❌ API Error: \(apiError.errorDescription ?? "unknown")")
                }
                alertMessage = "予約に失敗しました: \(error.localizedDescription)"
                showingAlert = true
            }
        }
    }

    private func cancelReservation(reservationId: String) {
        Task {
            do {
                try await eventsViewModel.cancelReservation(reservationId: reservationId)
                alertMessage = "予約をキャンセルしました"
                showingAlert = true
            } catch {
                alertMessage = "予約のキャンセルに失敗しました: \(error.localizedDescription)"
                showingAlert = true
            }
        }
    }

    private func closeEvent() {
        Task {
            do {
                try await eventsViewModel.updateEvent(id: event.id, status: "completed")
                alertMessage = "イベントを締め切りました"
                showingAlert = true
            } catch {
                alertMessage = "イベントの締め切りに失敗しました: \(error.localizedDescription)"
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
                alertMessage = "イベントの削除に失敗しました: \(error.localizedDescription)"
                showingAlert = true
            }
        }
    }
}
