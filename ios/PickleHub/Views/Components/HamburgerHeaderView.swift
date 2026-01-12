import SwiftUI

struct HamburgerHeaderView: View {
    let title: String
    let onMenuTap: () -> Void
    var trailingContent: AnyView? = nil

    var body: some View {
        HStack(spacing: 12) {
            // Hamburger menu button
            Button(action: onMenuTap) {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(Color(red: 26/255, green: 26/255, blue: 46/255))
                    .frame(width: 44, height: 44)
            }

            // Title
            Text(title)
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(Color(red: 26/255, green: 26/255, blue: 46/255))

            Spacer()

            // Optional trailing content
            if let trailing = trailingContent {
                trailing
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color.white)
        .overlay(
            Rectangle()
                .fill(Color(red: 229/255, green: 229/255, blue: 229/255))
                .frame(height: 1),
            alignment: .bottom
        )
    }
}

extension HamburgerHeaderView {
    init(title: String, onMenuTap: @escaping () -> Void) {
        self.title = title
        self.onMenuTap = onMenuTap
        self.trailingContent = nil
    }

    init<Trailing: View>(title: String, onMenuTap: @escaping () -> Void, @ViewBuilder trailing: () -> Trailing) {
        self.title = title
        self.onMenuTap = onMenuTap
        self.trailingContent = AnyView(trailing())
    }
}

#Preview {
    VStack(spacing: 0) {
        HamburgerHeaderView(title: "イベント") {
            print("Menu tapped")
        }

        HamburgerHeaderView(title: "チーム", onMenuTap: { print("Menu tapped") }) {
            Button(action: {}) {
                Image(systemName: "plus")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.twitterBlue)
            }
        }

        Spacer()
    }
}
