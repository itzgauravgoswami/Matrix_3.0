import React, { useState } from 'react'; 
import CodeHighlighter from './CodeHighlighter'; 

const CodeShowcase = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('java'); 

  const codeExamples = {
    java: `// Abstract Class Shape banayein: abstract class Shape { 
  abstract double calculateArea();  // Abstract method without body 
}

// Circle class banayein jo Shape ko extend kare: 
class Circle extends Shape {
  double radius; 
  
  Circle(double r) { 
    this.radius = r;  
  }
  
  @Override 
  double calculateArea() { 
    return Math.PI * radius * radius;  
  }
}

// Rectangle class banayein jo Shape ko extend kare: 
class Rectangle extends Shape {
  double length, width; 
  
  Rectangle(double l, double w) { 
    this.length = l;  
    this.width = w;  
  }
  
  @Override 
  double calculateArea() { 
    return length * width;  // Area of rectangle 
  }
}`,

    python: `# Abstract Class Shape banayein:
from abc import ABC, abstractmethod
import math

class Shape(ABC):
    @abstractmethod
    def calculateArea(self):
        pass  # Abstract method without body

# Circle class banayein jo Shape ko extend kare:
class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    
    def calculateArea(self):
        return math.pi * self.radius * self.radius

# Rectangle class banayein jo Shape ko extend kare:
class Rectangle(Shape):
    def __init__(self, length, width):
        self.length = length
        self.width = width
    
    def calculateArea(self):
        return self.length * self.width

# Main method mein objects bana ke area calculate karein:
if __name__ == "__main__":
    circle = Circle(5)
    print(f"Circle Area: {circle.calculateArea()}")
    
    rect = Rectangle(10, 20)
    print(f"Rectangle Area: {rect.calculateArea()}")`,

    javascript: `// Abstract Class Shape banayein:
class Shape {
  calculateArea() {
    throw new Error("Abstract method must be implemented"); 
  }
}

// Circle class banayein jo Shape ko extend kare:
class Circle extends Shape {
  constructor(radius) {
    super(); 
    this.radius = radius; 
  }
  
  calculateArea() {
    return Math.PI * this.radius * this.radius; 
  }
}

// Rectangle class banayein jo Shape ko extend kare:
class Rectangle extends Shape {
  constructor(length, width) {
    super(); 
    this.length = length; 
    this.width = width; 
  }
  
  calculateArea() {
    return this.length * this.width; 
  }
}

// Main mein objects bana ke area calculate karein:
const circle = new Circle(5); 
console.log("Circle Area: " + circle.calculateArea()); 

const rect = new Rectangle(10, 20); 
console.log("Rectangle Area: " + rect.calculateArea()); `,

    cpp: `// Abstract Class Shape banayein:
#include <iostream>
#include <cmath>
using namespace std; 

class Shape {
public:
    virtual double calculateArea() = 0;  // Pure virtual function
    virtual ~Shape() {}
}; 

// Circle class banayein jo Shape ko extend kare:
class Circle : public Shape {
private:
    double radius; 
public:
    Circle(double r) { 
        radius = r;  
    }
    
    double calculateArea() override { 
        return M_PI * radius * radius;  
    }
}; 

// Rectangle class banayein jo Shape ko extend kare:
class Rectangle : public Shape {
private:
    double length, width; 
public:
    Rectangle(double l, double w) { 
        length = l;  
        width = w;  
    }
    
    double calculateArea() override { 
        return length * width;  
    }
}; 

int main() {
    Circle circle(5); 
    cout << "Circle Area: " << circle.calculateArea() << endl; 
    
    Rectangle rect(10, 20); 
    cout << "Rectangle Area: " << rect.calculateArea() << endl; 
    
    return 0; 
}`,
  }; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            ✨ Code Syntax Highlighter Showcase
          </h1>
          <p className="text-slate-400 text-lg">
            Professional code display with syntax highlighting
          </p>
        </div>

        {/* Language Selector */}
        <div className="mb-8 flex gap-3 flex-wrap">
          <span className="text-white font-semibold self-center">Select Language:</span>
          {Object.keys(codeExamples).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                selectedLanguage === lang
                  ? 'bg-gradient-to-r from-purple-600 to-magenta-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Code Display */}
        <CodeHighlighter
          code={codeExamples[selectedLanguage]}
          language={selectedLanguage}
          title={`Solution Code - ${selectedLanguage.toUpperCase()}`}
          showCopy={true}
        />

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-blue-300 font-bold mb-4 text-lg flex items-center gap-2">
              <span>✨</span>
              Features
            </h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li className="flex gap-2">
                <span className="text-blue-400">✓</span>
                <span>Professional syntax highlighting</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">✓</span>
                <span>Copy to clipboard functionality</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">✓</span>
                <span>Multiple language support</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">✓</span>
                <span>Responsive design</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">✓</span>
                <span>Dark theme with vibrant colors</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-green-300 font-bold mb-4 text-lg flex items-center gap-2">
              <span>🎯</span>
              How to Use
            </h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li className="flex gap-2">
                <span className="text-green-400">1.</span>
                <span>Import CodeHighlighter component</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400">2.</span>
                <span>Pass code as prop</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400">3.</span>
                <span>Specify programming language</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400">4.</span>
                <span>Add optional title</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400">5.</span>
                <span>Users can copy with one click</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-12 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-purple-300 font-bold mb-4 text-lg">
            📋 Usage Example
          </h3>
          <CodeHighlighter
            code={`import CodeHighlighter from './components/CodeHighlighter'; 

export default function MyComponent() {
  const code = \`public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello World"); 
  }
}\`; 

  return (
    <CodeHighlighter
      code={code}
      language="java"
      title="Hello World Program"
      showCopy={true}
    />
  ); 
}`}
            language="jsx"
            title="React Integration Example"
            showCopy={true}
          />
        </div>
      </div>
    </div>
  ); 
}; 

export default CodeShowcase; 
