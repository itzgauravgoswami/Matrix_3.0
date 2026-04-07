import React from 'react'; 
import CodeHighlighter from './CodeHighlighter'; 

const CodeExample = () => {
  const javaCode = `// Abstract Class Shape banayein: abstract class Shape { abstract double calculateArea();  // Abstract method without body }

// Circle class banayein jo Shape ko extend kare: class Circle extends Shape {
  double radius; 
  Circle(double r) { this.radius = r;  }
  @Override double calculateArea() { return Math.PI * r * r;  }
}

// Rectangle class banayein jo Shape ko extend kare: class Rectangle extends Shape {
  double length, width; 
  Rectangle(double l, double w) { this.length = l;  this.width = w;  }
  @Override double calculateArea() { return length * width;  // Area of rectangle }
}

// Main method mein objects bana ke area calculate karein: import java.util.Scanner; 
public class AreaCalculator {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in); 
    System.out.println("Enter radius for Circle: "); 
    double r = sc.nextDouble(); 
    Shape circle = new Circle(r); 
    System.out.println("Circle Area: " + circle.calculateArea()); 
    
    // Output: Circle Area: ≈ 3.14 × r²
    System.out.println("Enter length and width for Rectangle: "); 
    double l = sc.nextDouble(); 
    double w = sc.nextDouble(); 
    Shape rect = new Rectangle(l, w); 
    System.out.println("Rectangle Area: " + rect.calculateArea()); 
    
    // Output: Rectangle Area: l × w
  }
}`; 

  const solutionText = `Problem mein abstract class, inheritance, method overriding aur polymorphism concepts cover ho jaate hain. Ye exam ke liye ek high-weightage problem type hai.`; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            💻 Solution: Abstract Class, Inheritance & Polymorphism
          </h1>
          <p className="text-slate-400 text-lg">
            OOP concepts ke saath Java code example
          </p>
        </div>

        {/* Code Section */}
        <div className="mb-8">
          <CodeHighlighter
            code={javaCode}
            language="java"
            title="Java Implementation"
            showCopy={true}
          />
        </div>

        {/* Explanation */}
        <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Solution Explanation
          </h2>
          <p className="text-slate-300 leading-relaxed text-base">
            {solutionText}
          </p>
        </div>

        {/* Key Concepts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-blue-300 font-bold mb-2">🔹 Abstract Class</h3>
            <p className="text-slate-300 text-sm">
              Base class jo direct instantiate nahi ho sakte, sirf inheritance ke liye
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-green-300 font-bold mb-2">🔹 Inheritance</h3>
            <p className="text-slate-300 text-sm">
              Child class parent class ke properties aur methods ko extend karte hain
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
            <h3 className="text-yellow-300 font-bold mb-2">🔹 Polymorphism</h3>
            <p className="text-slate-300 text-sm">
              Ek method different shapes ke liye alag behavior deta hai
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/30 rounded-lg p-4">
            <h3 className="text-pink-300 font-bold mb-2">🔹 Method Overriding</h3>
            <p className="text-slate-300 text-sm">
              @Override se child class apna version implement karte hain
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-purple-300 font-bold mb-3 flex items-center gap-2">
            <span>💡</span>
            Important Points
          </h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex gap-3">
              <span className="text-purple-400">✓</span>
              <span>Abstract method ka body nahi hota - sirf declaration hota hai</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400">✓</span>
              <span>Child class ko parent ke sab abstract methods implement karne hote hain</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400">✓</span>
              <span>Shape ka reference alag alag objects ko point kar sakta hai</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400">✓</span>
              <span>Runtime par sahi method call hota hai - ye polymorphism hai</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  ); 
}; 

export default CodeExample; 
