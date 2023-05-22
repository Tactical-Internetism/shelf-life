//
//  ContentView.swift
//  postcard
//
//  Created by Ashwin Agarwal on 5/20/23.
//

import SwiftUI

struct ContentView: View {
    @Binding var thisFridge: Fridge?
    @EnvironmentObject var dataManager: DataManager
    @State private var fridgeNumber: String = ""
    @State private var fridgeName: String = ""
    @State private var currentMessage: Message? = nil

    var login: some View {
        VStack() {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundColor(.accentColor)
            Text("Let's login!")
            TextField(
                "Fridge Phone Number", text: $fridgeNumber
            )
            .keyboardType(.numberPad)
            Button("Submit") {
                dataManager.findThisFridge(fridgeNumber: fridgeNumber)
            }
        }
        .padding()
    }

    var chooseName: some View {
        VStack() {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundColor(.accentColor)
            Text("Let's name your fridge!")
            TextField(
                "Fridge Name", text: $fridgeName
            )
            Button("Submit") {
                thisFridge!.fridgeName = fridgeName
                dataManager.updateThisFridge()
            }
        }
        .padding()
    }

    var shelf: some View {
        VStack() {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundColor(.accentColor)
            Text("Hello, \(thisFridge!.fridgeName)!")
            Button {
                dataManager.fetchNewMessages()
            } label: {
                Image(systemName: "arrow.clockwise.circle.fill")
            }

            ScrollView(.horizontal) {
                HStack() {
                    ForEach(dataManager.messages, id: \.id) { message in
                        Button {
                            print("hi")
                            currentMessage = message
                        } label: {
                            Image(dataManager.getImageString(id: message.id, open: false))
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .overlay {
                                    VStack() {
                                        if (message.senderName != nil) {
                                            TapeLabel(text: message.senderName!)
                                        }
                                        let formattedDate = message.createdAt.formatted(Date.FormatStyle()
                                            .month(.twoDigits)
                                            .day(.twoDigits)
                                        )
                                        TapeLabel(text: formattedDate)
                                    }
                                }
                        }
                        .frame(width: 150, height: 150)
                    }
                }
            }
        }
        .padding()
        .onAppear {
            dataManager.fetchNewMessages()
        }
    }

    var itemView: some View {
        VStack() {
            let message = currentMessage!
            HStack() {
                Image(dataManager.getImageString(id: message.id, open: true))
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                if (message.senderName != nil) {
                    Text(message.senderName!)
                }
            }
            .frame(height: 100)
            Text(message.note)
            WebView(url: URL(string: message.link)!)
                .border(.black)
                .padding()
            Button {
                currentMessage = nil
            } label: {
                Text("Toss Out")
            }
        }
    }

    var body: some View {
        if (currentMessage != nil) {
            itemView
        } else if thisFridge == nil {
            login
        } else if thisFridge!.fridgeName.isEmpty {
            chooseName
        } else {
            shelf
        }
    }
}

//struct ItemView: View {
//    @State private var
//}

struct TapeLabel: View {
    let text: String
    var body: some View {
        Text(text)
            .foregroundColor(.black)
            .font(.custom("MarkerFelt-Wide", fixedSize: 20))
            .padding()
    }
}

struct ContentView_Previews: PreviewProvider {
    @StateObject static private var dataManager = DataManager()
    static var previews: some View {
        ContentView(thisFridge: $dataManager.thisFridge).environmentObject(dataManager)
    }
}
