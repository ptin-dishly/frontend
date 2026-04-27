import React, { useState } from "react";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import BigButton from "../components/BigButton";
import SelectDropdown from "../components/SelectDropdown";
import IngredientCard from "../components/IngredientCard";
import NewIngredientCard from "../components/NewIngredientCard";
import { useNavigate } from "react-router-dom";

export default function IngredientsPage() {
    const [globalSearch, setGlobalSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const navigate = useNavigate();

    const categoryOptions = [
        { label: "Totes les categories", value: "" },
        { label: "Carn", value: "Carn" },
        { label: "Làctics", value: "Làctics" },
        { label: "Frescos", value: "Frescos" },
        { label: "Secs", value: "Secs" },
    ];
    const ingredients = [
        {
            id: "1",
            category: "Carn",
            name: "Mitjanes de Xai",
            image: "/ingredients/xai.png",
            quantityKg: 15,
            expirationDays: 5,
        },
        {
            id: "2",
            category: "Làctics",
            name: "Nata",
            image: "/ingredients/nata.png",
            quantityKg: 4,
            expirationDays: 14,
        },
        {
            id: "3",
            category: "Frescos",
            name: "Coliflor",
            image: "/ingredients/coliflor.png",
            quantityKg: 20,
            expirationDays: 7,
        },
        {
            id: "4",
            category: "Secs",
            name: "Farina",
            image: "/ingredients/farina.png",
            quantityKg: 120,
            expirationDays: 180,
        },
        {
            id: "5",
            category: "Frescos",
            name: "Tomàquet",
            image: "/ingredients/tomato.png",
            quantityKg: 8,
            expirationDays: 3,
        },
        {
            id: "6",
            category: "Làctics",
            name: "Formatge",
            image: "/ingredients/cheese.png",
            quantityKg: 10,
            expirationDays: 20,
        },
    ];


    const filteredIngredients = ingredients.filter((ingredient) => {
        const matchesSearch =
            ingredient.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
            ingredient.category.toLowerCase().includes(globalSearch.toLowerCase());

        const matchesCategory =
            categoryFilter === "" || ingredient.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const lowStockCount = ingredients.filter(
        (ingredient) => ingredient.quantityKg <= 5
    ).length;

    const expireSoonCount = ingredients.filter(
        (ingredient) => ingredient.expirationDays <= 7
    ).length;

    return (
        <div
            style={{
                display: "flex",
                backgroundColor: "var(--color-white)",
                minHeight: "100vh",
            }}
        >
            <MenuBar role="admin" />

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "40px 20px",
                }}
            >
                <div style={{ width: "100%", maxWidth: "1100px" }}>
                    <h1
                        style={{
                            fontFamily: "Fustat",
                            color: "var(--color-dark-blue)",
                            fontSize: 32,
                            margin: 0,
                            marginBottom: 30,
                        }}
                    >
                        Ingredients' Stock
                    </h1>

                    <div
                        style={{
                            marginBottom: 40,
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <SearchBar
                            value={globalSearch}
                            onChange={setGlobalSearch}
                            placeholder="Cerca ingredients..."
                        />
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 24,
                            marginBottom: 50,
                            flexWrap: "wrap",
                        }}
                    >
                        <BigButton
                            label="Total ingredients"
                            value={ingredients.length}
                            variant="navy"
                        />
                        <BigButton
                            label="Cad. propera"
                            value={expireSoonCount}
                            variant="navy"
                        />
                        <BigButton
                            label="Stock baix"
                            value={lowStockCount}
                            variant="navy"
                        />
                        {ingredients.length > 11 && (
                            <BigButton
                                label="Nou ingredient"
                                value="+"
                                variant="green"
                                onClick={() => navigate("/ingredients/new")}
                            />
                        )
                        }
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 30,
                            flexWrap: "wrap",
                            gap: 20,
                        }}
                    >
                        <h2
                            style={{
                                fontFamily: "Fustat",
                                fontSize: 22,
                                color: "var(--color-dark-blue)",
                                margin: 0,
                            }}
                        >
                            Ingredients
                        </h2>

                        <SelectDropdown
                            options={categoryOptions}
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                            placeholder="Categoria"
                        />
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                            gap: "24px",
                            justifyItems: "center",
                            width: "100%",
                        }}
                    >
                        {filteredIngredients.map((ingredient) => (
                            <IngredientCard
                                key={ingredient.id}
                                category={ingredient.category}
                                name={ingredient.name}
                                image={ingredient.image}
                                quantity={`${ingredient.quantityKg} Kg`}
                                expiration={`Caduca en ${ingredient.expirationDays} dies`}
                                onClick={() => console.log("Ingredient:", ingredient)}
                            />
                        ))}

                        <NewIngredientCard
                                onClick={() => navigate("/ingredients/new")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}