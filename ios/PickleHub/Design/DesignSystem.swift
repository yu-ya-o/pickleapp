import SwiftUI

// MARK: - Colors
extension Color {
    static let appPrimary = Color("PrimaryColor") // ブランドカラー
    static let appSecondary = Color("SecondaryColor")
    static let appBackground = Color("BackgroundColor")
    static let appSurface = Color("SurfaceColor")
    static let appBorder = Color("BorderColor")
    static let appText = Color("TextColor")
    static let appTextSecondary = Color("TextSecondaryColor")

    // X風のカラーパレット
    static let twitterBlue = Color(red: 29/255, green: 155/255, blue: 240/255)
    static let twitterGray = Color(red: 239/255, green: 243/255, blue: 244/255)
    static let twitterDarkGray = Color(red: 51/255, green: 54/255, blue: 57/255)

    // Fallback for custom colors
    init(_ name: String) {
        self.init(uiColor: UIColor(named: name) ?? .systemBlue)
    }
}

// MARK: - Typography
extension Font {
    // Display
    static let displayLarge = Font.system(size: 34, weight: .bold)
    static let displayMedium = Font.system(size: 28, weight: .bold)
    static let displaySmall = Font.system(size: 24, weight: .bold)

    // Headline
    static let headlineLarge = Font.system(size: 20, weight: .semibold)
    static let headlineMedium = Font.system(size: 18, weight: .semibold)
    static let headlineSmall = Font.system(size: 16, weight: .semibold)

    // Body
    static let bodyLarge = Font.system(size: 17, weight: .regular)
    static let bodyMedium = Font.system(size: 15, weight: .regular)
    static let bodySmall = Font.system(size: 13, weight: .regular)

    // Label
    static let labelLarge = Font.system(size: 15, weight: .medium)
    static let labelMedium = Font.system(size: 13, weight: .medium)
    static let labelSmall = Font.system(size: 11, weight: .medium)
}

// MARK: - Spacing
enum Spacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 16
    static let lg: CGFloat = 24
    static let xl: CGFloat = 32
    static let xxl: CGFloat = 48
}

// MARK: - Corner Radius
enum CornerRadius {
    static let small: CGFloat = 8
    static let medium: CGFloat = 12
    static let large: CGFloat = 16
    static let xlarge: CGFloat = 24
    static let circle: CGFloat = 999
}

// MARK: - Shadow
struct ShadowStyle {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat

    static let soft = ShadowStyle(color: .black.opacity(0.08), radius: 8, x: 0, y: 2)
    static let medium = ShadowStyle(color: .black.opacity(0.12), radius: 16, x: 0, y: 4)
    static let hard = ShadowStyle(color: .black.opacity(0.16), radius: 24, x: 0, y: 8)
}

extension View {
    func shadow(_ style: ShadowStyle) -> some View {
        self.shadow(color: style.color, radius: style.radius, x: style.x, y: style.y)
    }
}

// MARK: - Button Styles
struct PrimaryButtonStyle: ButtonStyle {
    var isLoading: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headlineMedium)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, Spacing.md)
            .background(
                RoundedRectangle(cornerRadius: CornerRadius.large)
                    .fill(Color.twitterBlue)
                    .opacity(configuration.isPressed ? 0.8 : 1.0)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.2), value: configuration.isPressed)
            .overlay {
                if isLoading {
                    ProgressView()
                        .tint(.white)
                }
            }
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headlineMedium)
            .foregroundColor(.twitterBlue)
            .frame(maxWidth: .infinity)
            .padding(.vertical, Spacing.md)
            .background(
                RoundedRectangle(cornerRadius: CornerRadius.large)
                    .strokeBorder(Color.twitterBlue, lineWidth: 1.5)
                    .background(
                        RoundedRectangle(cornerRadius: CornerRadius.large)
                            .fill(Color.twitterGray.opacity(configuration.isPressed ? 1 : 0))
                    )
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.2), value: configuration.isPressed)
    }
}

// MARK: - Card Style
struct CardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(Color.white)
            .cornerRadius(CornerRadius.medium)
            .shadow(.soft)
    }
}

extension View {
    func cardStyle() -> some View {
        self.modifier(CardModifier())
    }
}
