import SwiftUI

struct DrawerMenuView: View {
    @Binding var isOpen: Bool
    @Binding var selectedTab: Int
    @EnvironmentObject var authViewModel: AuthViewModel
    let onLogout: () -> Void

    private let drawerWidth: CGFloat = 280

    private var menuItems: [(icon: String, label: String, index: Int)] {
        [
            ("calendar", "イベント", 0),
            ("person.3.fill", "チーム", 1),
            ("trophy.fill", "ランキング", 2),
            ("bell.fill", "通知", 3),
            ("person.circle", "プロフィール", 4)
        ]
    }

    var body: some View {
        ZStack {
            // Overlay
            if isOpen {
                Color.black.opacity(0.5)
                    .ignoresSafeArea()
                    .onTapGesture {
                        withAnimation(.easeOut(duration: 0.3)) {
                            isOpen = false
                        }
                    }
            }

            // Drawer
            HStack(spacing: 0) {
                VStack(spacing: 0) {
                    // Header
                    HStack {
                        Text("PickleHub")
                            .font(.system(size: 24, weight: .black))
                            .italic()
                            .foregroundColor(Color(red: 26/255, green: 26/255, blue: 46/255))

                        Spacer()

                        Button(action: {
                            withAnimation(.easeOut(duration: 0.3)) {
                                isOpen = false
                            }
                        }) {
                            Image(systemName: "xmark")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(Color(red: 26/255, green: 26/255, blue: 46/255))
                                .frame(width: 36, height: 36)
                                .background(Color(red: 240/255, green: 240/255, blue: 240/255))
                                .clipShape(Circle())
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 16)
                    .overlay(
                        Rectangle()
                            .fill(Color(red: 229/255, green: 229/255, blue: 229/255))
                            .frame(height: 1),
                        alignment: .bottom
                    )

                    // Navigation Items
                    VStack(spacing: 4) {
                        ForEach(menuItems, id: \.index) { item in
                            MenuItemButton(
                                icon: item.icon,
                                label: item.label,
                                isActive: selectedTab == item.index,
                                action: {
                                    selectedTab = item.index
                                    withAnimation(.easeOut(duration: 0.3)) {
                                        isOpen = false
                                    }
                                }
                            )
                        }
                    }
                    .padding(16)

                    Spacer()

                    // Footer
                    VStack(spacing: 12) {
                        Button(action: {
                            withAnimation(.easeOut(duration: 0.3)) {
                                isOpen = false
                            }
                            onLogout()
                        }) {
                            HStack(spacing: 14) {
                                Image(systemName: "rectangle.portrait.and.arrow.right")
                                    .font(.system(size: 20))
                                Text("ログアウト")
                                    .font(.system(size: 15))
                                Spacer()
                            }
                            .foregroundColor(Color(red: 220/255, green: 38/255, blue: 38/255))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                            .background(Color.clear)
                            .cornerRadius(12)
                        }

                        Text("PickleHub v1.0")
                            .font(.system(size: 12))
                            .foregroundColor(Color(red: 136/255, green: 136/255, blue: 136/255))
                    }
                    .padding(16)
                    .overlay(
                        Rectangle()
                            .fill(Color(red: 229/255, green: 229/255, blue: 229/255))
                            .frame(height: 1),
                        alignment: .top
                    )
                }
                .frame(width: drawerWidth)
                .background(Color.white)
                .offset(x: isOpen ? 0 : -drawerWidth)

                Spacer()
            }
        }
        .animation(.easeOut(duration: 0.3), value: isOpen)
    }
}

struct MenuItemButton: View {
    let icon: String
    let label: String
    let isActive: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Image(systemName: icon)
                    .font(.system(size: 20, weight: isActive ? .semibold : .regular))
                Text(label)
                    .font(.system(size: 15, weight: isActive ? .semibold : .regular))
                Spacer()
            }
            .foregroundColor(isActive ? Color.twitterBlue : Color(red: 26/255, green: 26/255, blue: 46/255))
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(
                isActive
                    ? LinearGradient(
                        colors: [
                            Color.twitterBlue.opacity(0.1),
                            Color(red: 118/255, green: 75/255, blue: 162/255).opacity(0.1)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    : LinearGradient(colors: [Color.clear], startPoint: .topLeading, endPoint: .bottomTrailing)
            )
            .cornerRadius(12)
        }
    }
}

#Preview {
    DrawerMenuView(
        isOpen: .constant(true),
        selectedTab: .constant(0),
        onLogout: {}
    )
    .environmentObject(AuthViewModel())
}
