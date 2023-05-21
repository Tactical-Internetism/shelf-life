//
//  ContentView.swift
//  postcard
//
//  Created by Ashwin Agarwal on 5/20/23.
//

import SwiftUI
import WebKit

struct ContentView: View {
    @EnvironmentObject var dataManager: DataManager
    
    var body: some View {
        VStack() {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundColor(.accentColor)
            Text("Hello, fridge!")
            
            if dataManager.messages.count > 0 {
                let message = dataManager.messages[0]
                WebView(url: URL(string: message.link)!)
                    .border(.black)
            }

        }
        .padding()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView().environmentObject(DataManager())
    }
}
