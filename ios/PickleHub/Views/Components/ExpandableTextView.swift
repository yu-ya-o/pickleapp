import SwiftUI

/// Instagram-like expandable text view with "続きを見る" (read more) button
struct ExpandableTextView: View {
    let text: String
    let lineLimit: Int
    let font: Font
    let foregroundColor: Color
    let alignment: TextAlignment

    @State private var isExpanded = false
    @State private var isTruncated = false

    init(
        text: String,
        lineLimit: Int = 3,
        font: Font = .body,
        foregroundColor: Color = .secondary,
        alignment: TextAlignment = .leading
    ) {
        self.text = text
        self.lineLimit = lineLimit
        self.font = font
        self.foregroundColor = foregroundColor
        self.alignment = alignment
    }

    var body: some View {
        VStack(alignment: alignment == .center ? .center : .leading, spacing: 4) {
            Text(text)
                .font(font)
                .foregroundColor(foregroundColor)
                .multilineTextAlignment(alignment)
                .lineLimit(isExpanded ? nil : lineLimit)
                .background(
                    // Measure the full text height to detect truncation
                    GeometryReader { geometry in
                        Text(text)
                            .font(font)
                            .multilineTextAlignment(alignment)
                            .lineLimit(nil)
                            .fixedSize(horizontal: false, vertical: true)
                            .background(
                                GeometryReader { fullGeometry in
                                    Color.clear
                                        .onAppear {
                                            // Compare heights to detect truncation
                                            let limitedHeight = geometry.size.height
                                            let fullHeight = fullGeometry.size.height
                                            isTruncated = fullHeight > limitedHeight + 1
                                        }
                                }
                            )
                            .hidden()
                    }
                )

            if isTruncated && !isExpanded {
                Button(action: {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        isExpanded = true
                    }
                }) {
                    Text("続きを見る")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.gray)
                }
            }
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        // Short text (no truncation)
        ExpandableTextView(
            text: "短いテキスト",
            lineLimit: 3
        )
        .padding()
        .background(Color.gray.opacity(0.1))

        // Long text (will be truncated)
        ExpandableTextView(
            text: "ピックルボール歴1年です。楽しく練習できる仲間を募集しています！初心者から上級者まで、どなたでも歓迎です。週末に練習会を開催しています。一緒に楽しくプレーしましょう！最近はダブルスの練習に力を入れています。",
            lineLimit: 3
        )
        .padding()
        .background(Color.gray.opacity(0.1))

        // Centered text
        ExpandableTextView(
            text: "ピックルボール歴1年です。楽しく練習できる仲間を募集しています！初心者から上級者まで、どなたでも歓迎です。週末に練習会を開催しています。一緒に楽しくプレーしましょう！",
            lineLimit: 3,
            alignment: .center
        )
        .padding()
        .background(Color.gray.opacity(0.1))
    }
    .padding()
}
