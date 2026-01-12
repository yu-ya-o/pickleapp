import SwiftUI

struct BattleRecordRowView: View {
    @Binding var record: BattleRecord
    var onDelete: (() -> Void)?

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Text("大会名")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .frame(width: 60, alignment: .leading)
                TextField("例: 福岡オープン", text: $record.tournamentName)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }

            HStack {
                Text("年月")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .frame(width: 60, alignment: .leading)
                TextField("例: 2025/12", text: $record.yearMonth)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.numbersAndPunctuation)
            }

            HStack {
                Text("成績")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .frame(width: 60, alignment: .leading)
                TextField("例: 優勝、3位", text: $record.result)
                    .textFieldStyle(RoundedBorderTextFieldStyle())

                if let onDelete = onDelete {
                    Button(action: onDelete) {
                        Image(systemName: "trash")
                            .foregroundColor(.red)
                    }
                    .buttonStyle(BorderlessButtonStyle())
                }
            }
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    Form {
        BattleRecordRowView(
            record: .constant(BattleRecord(tournamentName: "福岡オープン", yearMonth: "2025/12", result: "3位")),
            onDelete: {}
        )
    }
}
