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
    
    var body: some View {
        if thisFridge == nil {
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
        } else if thisFridge!.fridgeName.isEmpty {
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
        } else {
            VStack() {
                Image(systemName: "globe")
                    .imageScale(.large)
                    .foregroundColor(.accentColor)
                Text("Hello, \(thisFridge!.fridgeName)!")
                Button("Refresh", action: dataManager.fetchNewMessages)

                if dataManager.messages.count > 0 {
                    let message = dataManager.messages[0]
                    WebView(url: URL(string: message.link)!)
                        .border(.black)
                }
            }
            .padding()
            .onAppear {
                dataManager.fetchNewMessages()
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    @StateObject static private var dataManager = DataManager()
    static var previews: some View {
        ContentView(thisFridge: $dataManager.thisFridge).environmentObject(dataManager)
    }
}
